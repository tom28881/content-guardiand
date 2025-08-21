import { storage } from '@forge/api';
import { randomUUID } from 'crypto';

export const STORAGE_KEYS = {
  SETTINGS: 'settings',
  DETECTED_INDEX: 'detected:index',
  AUDIT_INDEX: 'audit:index',
  LAST_SCAN: 'scan:lastRun',
};

export async function getIndex(key) {
  return (await storage.get(key)) ?? [];
}

export async function setIndex(key, ids) {
  await storage.set(key, ids || []);
}

export async function getSettingsFromStore() {
  return (await storage.get(STORAGE_KEYS.SETTINGS)) ?? {};
}

// Batch-get helper compatible with Forge runtime where storage.getBulk is unavailable
export async function getMany(keys) {
  const out = {};
  const CHUNK = 100;
  for (let i = 0; i < keys.length; i += CHUNK) {
    const slice = keys.slice(i, i + CHUNK);
    const results = await Promise.all(slice.map((k) => storage.get(k)));
    for (let j = 0; j < slice.length; j++) {
      out[slice[j]] = results[j] ?? null;
    }
  }
  return out;
}

export async function putDetectedItem(id, item) {
  await storage.set(`detected:${id}`, item);
}

export async function setLastScan(ts) {
  await storage.set(STORAGE_KEYS.LAST_SCAN, ts);
}

export async function getScanState() {
  return await storage.get('scan:state');
}

export async function setScanState(state) {
  await storage.set('scan:state', state);
}

export async function clearScanState() {
  await storage.delete('scan:state');
}

export async function getLock() {
  return await storage.get('scan:lock');
}

export async function setLock(data) {
  await storage.set('scan:lock', data);
}

export async function clearLock() {
  await storage.delete('scan:lock');
}

export async function addAuditLogEntry(data) {
  const auditId = randomUUID();
  const auditEntry = {
    ...data,
    id: auditId,
    timestamp: new Date().toISOString(),
  };

  await storage.set(`audit:${auditId}`, auditEntry);

  const currentIndex = await getIndex(STORAGE_KEYS.AUDIT_INDEX);
  const newIndex = [auditId, ...currentIndex].slice(0, 1000);
  await setIndex(STORAGE_KEYS.AUDIT_INDEX, newIndex);

  return auditEntry;
}

export async function getAuditLog({ page = 1, pageSize = 20 } = {}) {
  const idx = await getIndex(STORAGE_KEYS.AUDIT_INDEX);
  const total = idx.length;

  const start = (Number(page) - 1) * Number(pageSize);
  const idsToFetch = idx.slice(start, start + Number(pageSize));

  if (idsToFetch.length === 0) {
    return { ok: true, total, items: [] };
  }

  const keysToFetch = idsToFetch.map((id) => `audit:${id}`);
  const itemsObject = await getMany(keysToFetch);
  const items = Object.values(itemsObject).filter(Boolean);

  return { ok: true, total, items };
}

export async function getDetectedPages({ page = 1, pageSize = 20, filters = {}, sortBy = 'impact', sortDir = 'desc' } = {}) {
  const allDetectedKeys = await getIndex(STORAGE_KEYS.DETECTED_INDEX);
  if (allDetectedKeys.length === 0) {
    return { results: [], total: 0 };
  }

  const allItems = await getMany(allDetectedKeys.map(id => `detected:${id}`));
  let filteredItems = Object.values(allItems).filter(Boolean);

  // Apply filters
  if (filters.status) {
    filteredItems = filteredItems.filter(item => item.status === filters.status);
  }
  if (filters.flags && filters.flags.length > 0) {
    filteredItems = filteredItems.filter(item => 
      filters.flags.every(flag => item.flags && item.flags[flag])
    );
  }
  if (typeof filters.minImpact !== 'undefined' && filters.minImpact !== null && !Number.isNaN(Number(filters.minImpact))) {
    const min = Number(filters.minImpact) || 0;
    filteredItems = filteredItems.filter(item => (Number(item.impactScore) || 0) >= min);
  }
  if (filters.search && String(filters.search).trim().length > 0) {
    const q = String(filters.search).trim().toLowerCase();
    filteredItems = filteredItems.filter(item => {
      const title = String(item.title || '').toLowerCase();
      const spaceKey = String(item.spaceKey || '').toLowerCase();
      return title.includes(q) || spaceKey.includes(q);
    });
  }

  // Sorting
  const dir = String(sortDir).toLowerCase() === 'asc' ? 1 : -1;
  if (String(sortBy).toLowerCase() === 'updated') {
    filteredItems.sort((a, b) => {
      const aTs = new Date(a.lastUpdated || a.createdAt || 0).getTime();
      const bTs = new Date(b.lastUpdated || b.createdAt || 0).getTime();
      return dir * (aTs - bTs);
    });
  } else {
    // Default: impact
    filteredItems.sort((a, b) => dir * ((Number(a.impactScore) || 0) - (Number(b.impactScore) || 0)));
  }

  const total = filteredItems.length;
  const start = (Number(page) - 1) * Number(pageSize);
  const paginatedItems = filteredItems.slice(start, start + Number(pageSize));

  return { results: paginatedItems, total };
}
