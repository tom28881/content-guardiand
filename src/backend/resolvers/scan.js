import { storage } from '@forge/api';
import { runRealScan, runSimulatedScan } from '../services/scan';

export function registerScanResolvers(resolver) {
  resolver.define('startScan', async ({ payload }) => {
    const { mode = 'real' } = payload || {};
    console.warn('[resolver.startScan] called', { mode, payload });

    try {
      // Check for scan lock
      const lockKey = 'scan:lock';
      const lock = await storage.get(lockKey);
      console.warn('[resolver.startScan] lock check', {
        hasLock: !!lock,
        lockTimestamp: lock?.timestamp,
        lockAge: lock ? Date.now() - lock.timestamp : 0,
        willBlock: lock && Date.now() - lock.timestamp < 600000,
      });
      if (lock && Date.now() - lock.timestamp < 600000) {
        return { ok: false, error: 'Scan already in progress' };
      }

      // Set lock
      await storage.set(lockKey, { timestamp: Date.now(), mode });

      try {
        console.warn('[resolver.startScan] starting', { mode });
        const res = mode === 'real' ? await runRealScan() : await runSimulatedScan();
        console.warn('[resolver.startScan] finished', res);
        return { ok: true, ...res };
      } finally {
        // Release lock
        await storage.delete(lockKey);
      }
    } catch (e) {
      console.error('[startScan] error', e);
      return { ok: false, error: e.message };
    }
  });
}
