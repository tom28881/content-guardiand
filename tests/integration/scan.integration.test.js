const { describe, it, expect, beforeEach } = require('@jest/globals');
require('../setup.js');

/**
 * Integration tests exercising resolver + scan with real storage helpers wired to
 * an in-memory Forge storage mock, and mocked Confluence API.
 */

describe('Integration: resolver + scan', () => {
  let forgeStorage;
  let handler;
  let scheduledScan;
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
    ({ handler, scan: scheduledScan } = require('../../src/backend/index.js'));
  });

  it('startScan(real) performs multi-batch scan with heartbeat, clears state and releases lock', async () => {
    // Save minimal settings (stale enabled to ensure detection)
    await forgeStorage.set('settings', {
      rules: {
        stale: { enabled: true, period: 30 },
        inactive: { enabled: false, period: 90 },
        orphaned: { enabled: false },
        incomplete: { enabled: false },
      },
      whitelist: { pageIds: [], spaceKeys: [] },
    });

    // Mock Confluence API: one page then empty with next-link to trigger heartbeat + state persistence
    const page1 = {
      id: 'A',
      title: 'Old Page',
      version: {
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      },
    };
    const nextLink = '...cursor=CURSOR_NEXT';

    jest
      .spyOn(confluence, 'getPagesBatchV2WithRetry')
      .mockResolvedValueOnce({ ok: true, body: { results: [page1], _links: { next: nextLink } } })
      .mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });
    jest.spyOn(confluence, 'hasChildPages').mockResolvedValue({ ok: true, hasChild: false });
    jest.spyOn(confluence, 'getSpaceKeyById').mockResolvedValue({ ok: false });

    // Act via resolver
    const res = await handler({ call: { functionKey: 'startScan', payload: { mode: 'real' } } });

    // Assert basic result
    expect(res).toEqual(
      expect.objectContaining({ ok: true, detected: 1, total: 1, duration: expect.any(Number) })
    );

    // Heartbeat: initial set by resolver + at least one refresh by runRealScan
    const lockSetCalls = forgeStorage.set.mock.calls.filter(([k]) => k === 'scan:lock');
    expect(lockSetCalls.length).toBeGreaterThanOrEqual(2);
    lockSetCalls.forEach(([, v]) => expect(v.mode).toBe('real'));

    // State persisted between batches with cursor
    const stateSetCalls = forgeStorage.set.mock.calls.filter(([k]) => k === 'scan:state');
    expect(stateSetCalls.length).toBeGreaterThan(0);
    const lastState = stateSetCalls[stateSetCalls.length - 1][1];
    expect(lastState?.phase).toBe('processing');
    expect(lastState?.progress?.cursor).toBe('CURSOR_NEXT');

    // On success, state cleared and lock released by resolver
    expect(forgeStorage.delete).toHaveBeenCalledWith('scan:state');
    expect(forgeStorage.delete).toHaveBeenCalledWith('scan:lock');

    // Detected index updated with the page id
    const idx = await forgeStorage.get('detected:index');
    expect(idx).toEqual(['A']);

    // Last scan timestamp set
    const lastScan = await forgeStorage.get('scan:lastRun');
    expect(typeof lastScan).toBe('string');
  });

  it('resumes after mid-scan failure using persisted state and then clears it on success', async () => {
    // Settings
    await forgeStorage.set('settings', {
      rules: {
        stale: { enabled: true, period: 30 },
        inactive: { enabled: false, period: 90 },
        orphaned: { enabled: false },
        incomplete: { enabled: false },
      },
      whitelist: { pageIds: [], spaceKeys: [] },
    });

    const pageB = {
      id: 'B',
      title: 'Old B',
      version: {
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      },
    };
    const nextLink = '...cursor=CURSOR_NEXT';

    const gpb = jest.spyOn(confluence, 'getPagesBatchV2WithRetry');
    jest.spyOn(confluence, 'hasChildPages').mockResolvedValue({ ok: true, hasChild: false });
    jest.spyOn(confluence, 'getSpaceKeyById').mockResolvedValue({ ok: false });

    // First run: process first batch successfully -> persist state, then fail on next call
    gpb
      .mockResolvedValueOnce({ ok: true, body: { results: [pageB], _links: { next: nextLink } } })
      .mockResolvedValueOnce({ ok: false, status: 500, body: {} });

    const res1 = await handler({ call: { functionKey: 'startScan', payload: { mode: 'real' } } });
    expect(res1).toEqual(expect.objectContaining({ ok: false }));

    // Persisted state should remain for resume
    const persistedState = await forgeStorage.get('scan:state');
    expect(persistedState?.progress?.cursor).toBe('CURSOR_NEXT');

    // Second run: continue and finish
    gpb.mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });

    const res2 = await handler({ call: { functionKey: 'startScan', payload: { mode: 'real' } } });
    expect(res2).toEqual(
      expect.objectContaining({ ok: true, detected: 1, total: 1, duration: expect.any(Number) })
    );

    // State cleared after success
    expect(await forgeStorage.get('scan:state')).toBeUndefined();
  });

  it('scheduledScan uses scheduled lock mode, refreshes heartbeat, and writes audit log', async () => {
    // Enable auto schedule
    await forgeStorage.set('settings', {
      schedule: { mode: 'auto' },
      rules: {
        stale: { enabled: false, period: 30 },
        inactive: { enabled: false, period: 90 },
        orphaned: { enabled: false },
        incomplete: { enabled: false },
      },
      whitelist: { pageIds: [], spaceKeys: [] },
    });

    const pageS = {
      id: 'S1',
      title: 'Sched Page',
      version: {
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2020-01-01T00:00:00.000Z',
      },
    };

    jest
      .spyOn(confluence, 'getPagesBatchV2WithRetry')
      .mockResolvedValueOnce({ ok: true, body: { results: [pageS], _links: { next: '...cursor=C2' } } })
      .mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });
    jest.spyOn(confluence, 'hasChildPages').mockResolvedValue({ ok: true, hasChild: false });
    jest.spyOn(confluence, 'getSpaceKeyById').mockResolvedValue({ ok: false });

    await scheduledScan();

    const lockSetCalls = forgeStorage.set.mock.calls.filter(([k]) => k === 'scan:lock');
    expect(lockSetCalls.length).toBeGreaterThanOrEqual(2);
    lockSetCalls.forEach(([, v]) => expect(v.mode).toBe('scheduled'));

    const auditIdx = await forgeStorage.get('audit:index');
    expect(Array.isArray(auditIdx)).toBe(true);
    expect(auditIdx.length).toBeGreaterThan(0);

    const firstAudit = await forgeStorage.get(`audit:${auditIdx[0]}`);
    expect(firstAudit?.action).toMatch(/scheduled_scan/);
  });
});
