const { describe, it, expect, beforeEach } = require('@jest/globals');
require('../setup.js');

/**
 * Integration tests for resolver: resetDetected
 */

describe('Integration: resetDetected resolver', () => {
  let forgeStorage;
  let handler;
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

    // Import modules under test
    ({ handler } = require('../../src/backend/index.js'));
  });

  it('requires confirmation', async () => {
    // Seed some detected data
    memory.set('detected:index', ['A']);
    memory.set('detected:A', { id: 'A', title: 'Page A', status: 'detected', flags: { stale: true } });

    const res = await handler({ call: { functionKey: 'resetDetected', payload: {} } });
    expect(res.ok).toBe(false);
    expect(String(res.error)).toMatch(/confirm/i);

    // Ensure no changes
    expect(await forgeStorage.get('detected:index')).toEqual(['A']);
    expect(await forgeStorage.get('detected:A')).toEqual(expect.any(Object));
  });

  it('clears detected index and items and returns removed count, writes audit', async () => {
    // Seed two detected items
    memory.set('detected:index', ['A', 'B']);
    memory.set('detected:A', { id: 'A', title: 'Page A', status: 'detected', flags: { stale: true } });
    memory.set('detected:B', { id: 'B', title: 'Page B', status: 'archived', flags: { stale: true } });

    const res = await handler({ call: { functionKey: 'resetDetected', payload: { confirm: true } }, context: { accountId: 'user-x' } });
    expect(res).toEqual({ ok: true, removed: 2 });

    const idx = await forgeStorage.get('detected:index');
    expect(idx).toEqual([]);
    expect(await forgeStorage.get('detected:A')).toBeUndefined();
    expect(await forgeStorage.get('detected:B')).toBeUndefined();

    // Audit log exists and contains reset_detected
    const auditList = await handler({ call: { functionKey: 'listAuditLog', payload: { page: 1, pageSize: 10 } } });
    expect(auditList.ok).toBe(true);
    const hasReset = auditList.items.some((e) => e.action === 'reset_detected');
    expect(hasReset).toBe(true);
  });

  it('is blocked when scan lock is fresh', async () => {
    // Create a fresh lock (less than 10 minutes old)
    memory.set('scan:lock', { timestamp: Date.now(), mode: 'real' });

    const res = await handler({ call: { functionKey: 'resetDetected', payload: { confirm: true } } });
    expect(res.ok).toBe(false);
    expect(String(res.error)).toMatch(/progress|later/i);
  });

  it('proceeds if scan lock is stale (older than 10 minutes)', async () => {
    // Prepare data
    memory.set('detected:index', ['A']);
    memory.set('detected:A', { id: 'A', title: 'Page A', status: 'detected', flags: {} });

    // Stale lock (> 10 minutes)
    memory.set('scan:lock', { timestamp: Date.now() - 601000, mode: 'real' });

    const res = await handler({ call: { functionKey: 'resetDetected', payload: { confirm: 'RESET' } } });
    expect(res.ok).toBe(true);
    expect(res.removed).toBe(1);
    expect(await forgeStorage.get('detected:index')).toEqual([]);
  });
});
