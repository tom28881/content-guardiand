const { describe, it, expect, beforeEach } = require('@jest/globals');
require('../setup.js');

/**
 * Basic usage E2E test covering: save settings -> start scan -> list -> export -> dry run -> apply archive -> audit log
 */

describe('Integration: basic usage flow', () => {
  let forgeStorage;
  let handler;
  let confluence;
  let memory;

  beforeEach(() => {
    // Fresh in-memory storage for each test
    memory = new Map();

    // Wire @forge/api.storage mock to real in-memory behavior
    forgeStorage = require('@forge/api').storage;
    forgeStorage.get.mockImplementation(async (k) => memory.get(k));
    forgeStorage.set.mockImplementation(async (k, v) => {
      memory.set(k, v);
    });
    forgeStorage.delete.mockImplementation(async (k) => {
      memory.delete(k);
    });

    // Import modules under test and API we will mock
    confluence = require('../../src/backend/services/confluence.js');
    ({ handler } = require('../../src/backend/index.js'));
  });

  it('runs the full basic flow successfully', async () => {
    // 1) Save settings to enable stale rule
    const settings = {
      rules: {
        stale: { enabled: true, period: 30 },
        inactive: { enabled: false, period: 90 },
        orphaned: { enabled: false },
        incomplete: { enabled: false },
      },
      whitelist: { pageIds: [], spaceKeys: [] },
    };
    const saveRes = await handler({ call: { functionKey: 'saveSettings', payload: { settings } } });
    expect(saveRes).toEqual({ ok: true });

    // 2) Mock Confluence API for a two-step scan
    const page = {
      id: 'A',
      title: 'Very Old Page',
      version: {
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      },
    };

    jest
      .spyOn(confluence, 'getPagesBatchV2WithRetry')
      .mockResolvedValueOnce({ ok: true, body: { results: [page], _links: { next: '...cursor=C1' } } })
      .mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });
    jest.spyOn(confluence, 'hasChildPages').mockResolvedValue({ ok: true, hasChild: false });
    jest.spyOn(confluence, 'getSpaceKeyById').mockResolvedValue({ ok: false });

    // 3) Start real scan via resolver
    const scanRes = await handler({ call: { functionKey: 'startScan', payload: { mode: 'real' } } });
    expect(scanRes).toEqual(
      expect.objectContaining({ ok: true, detected: 1, total: 1, duration: expect.any(Number) })
    );

    // Detected index and item exist
    const idx = await forgeStorage.get('detected:index');
    expect(idx).toEqual(['A']);
    const detectedItem = await forgeStorage.get('detected:A');
    expect(detectedItem).toEqual(
      expect.objectContaining({ id: 'A', status: 'detected', flags: expect.any(Object) })
    );
    expect(detectedItem.flags.stale).toBe(true);

    // 4) List detected pages
    const listRes = await handler({ call: { functionKey: 'listDetectedPages', payload: { page: 1, pageSize: 10 } } });
    expect(listRes.ok).toBe(true);
    expect(listRes.total).toBe(1);
    expect(listRes.results.length).toBe(1);
    expect(listRes.results[0].id).toBe('A');
    expect(listRes.results[0].status).toBe('detected');

    // 5) Export detected pages
    const exportRes = await handler({ call: { functionKey: 'exportDetectedPages', payload: { filters: {}, ids: [] } } });
    expect(exportRes.ok).toBe(true);
    expect(exportRes.total).toBe(1);
    expect(typeof exportRes.csv).toBe('string');
    expect(exportRes.csv).toContain('id,title,spaceKey,impactScore,lastUpdated,status,stale,inactive,orphaned,incomplete');
    expect(exportRes.csv).toContain('A');
    expect(typeof exportRes.excelHtml).toBe('string');
    expect(exportRes.excelHtml).toContain('<table>');

    // 6) Dry run archive action
    const dryRes = await handler({ call: { functionKey: 'dryRunAction', payload: { pageIds: ['A'], action: 'archive' } } });
    expect(dryRes).toEqual({ ok: true, counts: { selected: 1, warnings: 0 }, action: 'archive' });

    // 7) Apply archive action (mock remote calls)
    jest.spyOn(confluence, 'archivePage').mockResolvedValue({ ok: true });
    jest.spyOn(confluence, 'addLabels').mockResolvedValue({ ok: true });
    jest.spyOn(confluence, 'setContentProperty').mockResolvedValue({ ok: true });

    const applyRes = await handler({
      call: { functionKey: 'applyBulkAction', payload: { pageIds: ['A'], action: 'archive', reason: 'cleanup' } },
      context: { accountId: 'user-1' },
    });
    expect(applyRes.ok).toBe(true);
    expect(applyRes.updated).toBe(1);
    expect(Array.isArray(applyRes.errors)).toBe(true);
    expect(applyRes.errors.length).toBe(0);

    const updatedItem = await forgeStorage.get('detected:A');
    expect(updatedItem.status).toBe('archived');
    expect(typeof updatedItem.statusAt).toBe('string');

    // 8) Audit log should include the archive action
    const auditList = await handler({ call: { functionKey: 'listAuditLog', payload: { page: 1, pageSize: 10 } } });
    expect(auditList.ok).toBe(true);
    expect(auditList.total).toBeGreaterThan(0);
    const hasArchive = auditList.items.some((e) => e.action === 'archive' && e.status === 'success');
    expect(hasArchive).toBe(true);
  });
});
