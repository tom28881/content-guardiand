import { storage } from '@forge/api';
import { getPagesBatchV2WithRetry, getSpaceKeyById, sleep, hasChildPages } from './confluence';
import { daysBetween } from '../utils/date';
import { getSettingsFromStore, getMany, putDetectedItem, getIndex, setIndex, setLastScan, STORAGE_KEYS } from '../storage';
import * as storageMod from '../storage';

// Keys used for cooperative lock and persisted state (for resilience)
const SCAN_LOCK_KEY = 'scan:lock';
const SCAN_STATE_KEY = 'scan:state';

function normalizeSettings(settings = {}) {
  const defaults = {
    rules: {
      stale: { enabled: false, period: 30 },
      inactive: { enabled: false, period: 90 },
      orphaned: { enabled: false },
      incomplete: { enabled: false, pattern: '\\b(WIP|TBD|TODO|DRAFT)\\b' },
    },
    whitelist: { pageIds: [], spaceKeys: [] },
  };

  const out = JSON.parse(JSON.stringify(defaults));

  const r = settings.rules || settings;
  if (r) {
    // New-style mapping
    if (r.stale) {
      out.rules.stale.enabled = !!r.stale.enabled;
      if (r.stale.period != null) out.rules.stale.period = Number(r.stale.period);
    }
    if (r.inactive) {
      out.rules.inactive.enabled = !!r.inactive.enabled;
      if (r.inactive.period != null) out.rules.inactive.period = Number(r.inactive.period);
    }
    if (r.orphaned) {
      out.rules.orphaned.enabled = !!r.orphaned.enabled;
    }
    if (r.incomplete) {
      out.rules.incomplete.enabled = !!r.incomplete.enabled;
      out.rules.incomplete.pattern = r.incomplete.pattern || out.rules.incomplete.pattern;
    }

    // Legacy keys mapping
    if (r.ageDays != null) {
      out.rules.stale.enabled = true;
      out.rules.stale.period = Number(r.ageDays);
    }
    if (r.inactivityDays != null) {
      out.rules.inactive.enabled = true;
      out.rules.inactive.period = Number(r.inactivityDays);
    }
    if (typeof r.includeOrphaned !== 'undefined') {
      out.rules.orphaned.enabled = !!r.includeOrphaned;
    }
    if (typeof r.includeIncomplete !== 'undefined') {
      out.rules.incomplete.enabled = !!r.includeIncomplete;
    }
  }

  const wl = settings.whitelist;
  if (Array.isArray(wl)) {
    out.whitelist.pageIds = wl.map(String);
  } else if (wl && typeof wl === 'object') {
    out.whitelist.pageIds = Array.isArray(wl.pageIds) ? wl.pageIds.map(String) : [];
    out.whitelist.spaceKeys = Array.isArray(wl.spaceKeys) ? wl.spaceKeys.map(String) : [];
  }

  return out;
}

function createInitialScanState(settings) {
  return {
    status: 'running',
    phase: 'processing',
    progress: { cursor: null, processedCount: 0 },
    allProcessedIds: [],
    settings,
    startedAt: new Date().toISOString(),
  };
}

function extractCursor(nextLink) {
  if (!nextLink) return null;
  const m = /cursor=([^&]+)/.exec(String(nextLink));
  return m ? decodeURIComponent(m[1]) : null;
}

async function processPageBatch(state) {
  const { settings, progress } = state;
  const { rules, whitelist } = settings;
  const limit = 50; // Smaller batch size for reliability


  const resp = await getPagesBatchV2WithRetry({ cursor: progress.cursor, limit });
  

  
  if (!resp.ok) {
    console.error('[scan] getPagesBatchV2 failed', { status: resp.status, body: resp.body });
    throw new Error(`Confluence API error: ${resp.status}`);
  }

  const pages = resp.body?.results || [];
  if (pages.length === 0) {

    return { ...state, phase: 'finalizing' };
  }

  const whitelistSpaces = new Set((whitelist?.spaceKeys || []).map(String));
  const whitelistPages = new Set((whitelist?.pageIds || []).map(String));
  const existingItems = await getMany(pages.map(p => `detected:${String(p.id)}`));


  for (const p of pages) {
    const id = String(p.id);
    // Resolve space key via v2 (cached internally)
    let spaceKey;
    if (p.spaceId) {
      const respKey = await getSpaceKeyById(p.spaceId);
      if (respKey && respKey.ok && respKey.key) spaceKey = respKey.key;
    }
    if (whitelistPages.has(id) || (whitelistSpaces.size > 0 && spaceKey && whitelistSpaces.has(spaceKey))) {
      continue;
    }

    let isOrphaned = false;
    if (rules?.orphaned?.enabled) {
      const { ok: okChild, hasChild } = await hasChildPages(id);
      if (!okChild) {
        console.error('[scan] hasChildPages failed, defaulting orphaned=false', { id });
      } else {
        isOrphaned = !hasChild;
      }
    }

    const title = p.title || '';
    const createdAt = p.version?.createdAt || new Date().toISOString();
    const lastUpdated = p.version?.updatedAt || createdAt;

    // Safe handling for incomplete regex patterns
    let incompleteFlag = false;
    if (rules?.incomplete?.enabled) {
      const pattern = rules?.incomplete?.pattern || '\\b(WIP|TBD|TODO|DRAFT)\\b';
      try {
        const re = new RegExp(pattern, 'i');
        incompleteFlag = re.test(title);
      } catch (e) {
        const re = /\b(WIP|TBD|TODO|DRAFT)\b/i;
        incompleteFlag = re.test(title);
      }
    }

    const flags = {
      stale: rules?.stale?.enabled ? daysBetween(lastUpdated, new Date()) >= (rules.stale.period ?? 30) : false,
      inactive: rules?.inactive?.enabled ? daysBetween(lastUpdated, new Date()) >= (rules.inactive.period ?? 90) : false,
      orphaned: rules?.orphaned?.enabled ? isOrphaned : false,
      incomplete: incompleteFlag,
    };

    // If no flags are active, we don't need to store the item
    if (!Object.values(flags).some(flag => flag === true)) {
      continue;
    }

    let impactScore = 10;
    if (flags.stale) impactScore += 40;
    if (flags.inactive) impactScore += 25;
    if (flags.orphaned) impactScore += 20;
    if (flags.incomplete) impactScore += 15;

    const existing = existingItems[`detected:${id}`];
    const status = existing?.status && existing.status !== 'detected' ? existing.status : 'detected';

    const item = { id, title, spaceKey, createdAt, lastUpdated, impactScore: Math.min(impactScore, 100), flags, status };
    await putDetectedItem(id, item);
    state.allProcessedIds.push(id);
  }

  state.progress.processedCount += pages.length;
  const linkNext = (resp && (resp.next || (resp.body && resp.body._links && resp.body._links.next))) || null;
  const nextCursor = extractCursor(linkNext);
  

  
  if (nextCursor) {
    state.progress.cursor = nextCursor;
  } else {
    state.phase = 'finalizing';
  }


  return state;
}

async function finalizeScan(state) {
  const prevIdx = await getIndex(STORAGE_KEYS.DETECTED_INDEX);

  const newSet = new Set(state.allProcessedIds.map(String));
  
  // PERFORMANCE FIX: Instead of iterating and fetching one by one, determine which old items to check and fetch them in one batch.
  const idsToCheck = prevIdx.filter(pid => !newSet.has(String(pid)));
  const itemsToCheck = await getMany(idsToCheck.map(id => `detected:${id}`));
  const preserveIds = idsToCheck.filter(id => {
    const item = itemsToCheck[`detected:${id}`];
    return item?.status && item.status !== 'detected';
  });



  const finalIds = Array.from(new Set([...state.allProcessedIds, ...preserveIds]));
  await setIndex(STORAGE_KEYS.DETECTED_INDEX, finalIds);
  const ts = new Date().toISOString();
  await setLastScan(ts);


  return { total: finalIds.length, lastScan: ts };
}

// --- Main Scan Functions ---

export async function runSimulatedScan() {
  const lastScan = await storage.get(STORAGE_KEYS.LAST_SCAN);
  const idx = await getIndex(STORAGE_KEYS.DETECTED_INDEX);
  return { ok: true, created: 0, total: idx.length, lastScan, mode: 'simulated' };
}

// This function contains the core, testable scan logic without any locking or state management side effects.
export async function _performScan(settings) {
  const normalizedSettings = normalizeSettings(settings);
  let state = createInitialScanState(normalizedSettings);

  while (state.phase === 'processing') {
    state = await processPageBatch(state);
    if (state.phase === 'finalizing') {
      break;
    }
  }

  const summary = await finalizeScan(state);
  return { detected: state.allProcessedIds.length, total: summary.total };
}

export async function runRealScan() {
  const LOCK_TTL_MS = 10 * 60 * 1000; // 10 minutes
  let weAcquiredLock = false;
  const startedAt = Date.now();
  try {
    // Cooperative lock: acquire only if no valid lock exists. If a lock exists, assume caller owns it (resolver/scheduler) and proceed.
    const existingLock = await storageMod.getLock();
    const hasActiveLock = !!existingLock && (Date.now() - Number(existingLock.timestamp)) < LOCK_TTL_MS;
    // Track current lock mode for heartbeat refresh; default to 'real' if unknown
    let currentLockMode = existingLock?.mode || 'real';
    if (!hasActiveLock) {
      await storageMod.setLock({ timestamp: Date.now(), mode: 'real' });
      weAcquiredLock = true;
      currentLockMode = 'real';
    }

    // Load settings and attempt to resume from persisted state if available
    const settings = await getSettingsFromStore();
    const normalizedSettings = normalizeSettings(settings);
    let state = await storageMod.getScanState();
    if (!state || typeof state !== 'object' || !state.phase) {
      state = createInitialScanState(normalizedSettings);
    } else {
      // Ensure settings present in state; if missing, inject normalized
      state.settings = state.settings || normalizedSettings;
    }

    // Process batches; persist only while still processing (not on finalizing)
    while (state.phase === 'processing') {
      state = await processPageBatch(state);
      if (state.phase === 'processing') {
        await storageMod.setScanState(state);
        // Heartbeat: refresh lock TTL to prevent parallel runs if scan exceeds TTL
        try {
          await storageMod.setLock({ timestamp: Date.now(), mode: currentLockMode });
        } catch (hbErr) {
          console.warn('[runRealScan] heartbeat refresh failed', hbErr);
        }
      } else {
        break;
      }
    }

    const summary = await finalizeScan(state);
    // On success, clear persisted state
    try {
      await storageMod.clearScanState();
    } catch (csErr) {
      console.warn('[runRealScan] clearScanState failed (ignored)', csErr);
    }
    return { detected: state.allProcessedIds.length, total: summary.total, duration: Date.now() - startedAt };
  } catch (e) {
    console.error('runRealScan failed', e);
    // Intentionally keep persisted state for resume on next run
    return { ok: false, error: e.message };
  } finally {
    if (weAcquiredLock) {
      try {
        await storageMod.clearLock();
      } catch (clErr) {
        console.warn('[runRealScan] clearLock failed (ignored)', clErr);
      }
    }
  }
}
