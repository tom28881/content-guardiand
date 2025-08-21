import { storage } from '@forge/api';
import { getSettingsFromStore, addAuditLogEntry } from '../storage';
import { runRealScan } from './scan';

export const scheduledScan = async () => {
  try {
    const s = await getSettingsFromStore();
    const enabled = (s?.schedule?.mode || 'manual') === 'auto';
    if (!enabled) {
      console.log('Scheduled scan skipped: schedule.mode != "auto"');
      return;
    }

    // Check for scan lock
    const lockKey = 'scan:lock';
    const lock = await storage.get(lockKey);
    if (lock && Date.now() - lock.timestamp < 600000) {
      console.log('Scheduled scan skipped: another scan in progress');
      return;
    }

    // Set lock
    await storage.set(lockKey, { timestamp: Date.now(), mode: 'scheduled' });

    try {
      const res = await runRealScan();
      console.log('Scheduled scan executed', res);

      // Log to audit
      await addAuditLogEntry({
        user: 'system',
        action: 'scheduled_scan',
        entityType: 'scan',
        entityId: null,
        details: { detected: res?.detected || 0, duration: res?.duration || 0 },
      });
    } finally {
      // Release lock
      await storage.delete(lockKey);
    }
  } catch (e) {
    console.error('Scheduled scan error', e);
    await addAuditLogEntry({
      user: 'system',
      action: 'scheduled_scan_failed',
      entityType: 'scan',
      entityId: null,
      details: { error: e.message },
    });
  }
};
