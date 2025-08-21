import { storage } from '@forge/api';
import { STORAGE_KEYS, getSettingsFromStore } from '../storage';

export function registerSettingsResolvers(resolver) {
  resolver.define('getSettings', async () => {
    const s = await getSettingsFromStore();
    return { ok: true, settings: s };
  });

  resolver.define('saveSettings', async ({ payload }) => {
    const s = payload?.settings;
    if (!s) return { ok: false, error: 'settings payload is required' };
    await storage.set(STORAGE_KEYS.SETTINGS, s);
    return { ok: true };
  });
}
