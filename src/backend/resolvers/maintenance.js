import { storage } from '@forge/api';
import { STORAGE_KEYS, getIndex, setIndex, addAuditLogEntry } from '../storage';

export function registerMaintenanceResolvers(resolver) {
  resolver.define('resetDetected', async ({ payload, context }) => {
    try {
      const confirm = payload?.confirm;
      if (!(confirm === true || String(confirm).toUpperCase() === 'RESET')) {
        return { ok: false, error: "Confirmation required. Pass confirm: true or 'RESET'." };
      }

      // Prevent reset while a scan is in progress
      const lockKey = 'scan:lock';
      const lock = await storage.get(lockKey);
      if (lock && Date.now() - (lock.timestamp || 0) < 600000) {
        return { ok: false, error: 'Scan in progress. Try again later.' };
      }

      const idx = await getIndex(STORAGE_KEYS.DETECTED_INDEX);
      const total = idx.length;

      if (total > 0) {
        const CHUNK = 100;
        for (let i = 0; i < idx.length; i += CHUNK) {
          const slice = idx.slice(i, i + CHUNK);
          // Delete detected:{id} keys in parallel per chunk
          // eslint-disable-next-line no-await-in-loop
          await Promise.all(slice.map((id) => storage.delete(`detected:${id}`)));
        }
      }
      await setIndex(STORAGE_KEYS.DETECTED_INDEX, []);

      // Audit log entry
      await addAuditLogEntry({
        user: context?.accountId || 'system',
        action: 'reset_detected',
        entityType: 'detected',
        entityId: null,
        ts: new Date().toISOString(),
        reason: payload?.reason || 'manual reset from UI',
        details: { removed: total },
      });

      return { ok: true, removed: total };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
}
