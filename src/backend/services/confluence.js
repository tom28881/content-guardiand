import { asApp, asUser, assumeTrustedRoute } from '@forge/api';

// Prefer /wiki/rest/api by default, but cache last working base to avoid repeated fallbacks
const BASES = ['/wiki/rest/api', '/rest/api'];
// API v2 bases for operations like archive
const BASES_V2 = ['/wiki/api/v2', '/api/v2'];
let preferredBaseIndex = 0; // 0 -> /wiki/rest/api, 1 -> /rest/api
const orderByPreference = () => [preferredBaseIndex, ...BASES.map((_, i) => i).filter((i) => i !== preferredBaseIndex)];
let preferredBaseIndexV2 = 0; // 0 -> /wiki/api/v2, 1 -> /api/v2
const orderByPreferenceV2 = () => [
  preferredBaseIndexV2,
  ...BASES_V2.map((_, i) => i).filter((i) => i !== preferredBaseIndexV2),
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function requestConfluenceJSON(path, options = {}) {
  const doReq = async (actor = 'app') => {
    const client = actor === 'user' ? asUser().requestConfluence : asApp().requestConfluence;
    const res = await client(
      assumeTrustedRoute(path),
      { method: 'GET', ...options }
    );
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      body = text;
    }
    const ra = res.headers?.get?.('retry-after') || res.headers?.get?.('Retry-After');
    const retryAfterSec = ra ? Number(ra) : undefined;
    console.warn('[Confluence][GET]', { actor, path, status: res.status, retryAfterSec });
    return { ok: res.ok, status: res.status, body, retryAfterSec };
  };

  // Try asApp first for service-level access; fall back to asUser on certain errors
  let resp = await doReq('app');
  if (!resp.ok && [401, 403, 404, 410].includes(resp.status)) {
    try {
      console.warn('[Confluence][GET] falling back to asUser due to status', resp.status);
      const alt = await doReq('user');
      if (alt.ok || alt.status !== resp.status) resp = alt;
    } catch (_) {}
  }
  return resp;
}

// V1 Content search helper supporting content expansions
export async function contentSearchCQL({ cql, limit = 50, start = 0, expand = '' } = {}) {
  if (!cql || typeof cql !== 'string') {
    return { ok: false, status: 400, body: { message: 'cql query is required' } };
  }
  const qs = [`cql=${encodeURIComponent(cql)}`];
  if (typeof limit === 'number') qs.push(`limit=${String(limit)}`);
  if (typeof start === 'number') qs.push(`start=${String(start)}`);
  if (expand && String(expand).trim()) qs.push(`expand=${encodeURIComponent(String(expand).trim())}`);
  const endpoint = `/content/search?${qs.join('&')}`;
  let lastResp = { ok: false, status: 0, body: null };
  for (const idx of orderByPreference()) {
    const path = `${BASES[idx]}${endpoint}`;
    const resp = await requestConfluenceJSON(path);
    lastResp = resp;
    if (resp.ok) {
      if (idx !== preferredBaseIndex) preferredBaseIndex = idx;
      return resp;
    }
    if (resp.status === 404 || resp.status === 410) {
      continue;
    }
    return resp;
  }
  return lastResp;
}

// Simple v1 CQL search helper used for counts and expanded fields
export async function searchCQL({ cql, limit = 50, start = 0, expand = '' } = {}) {
  if (!cql || typeof cql !== 'string') {
    return { ok: false, status: 400, body: { message: 'cql query is required' } };
  }
  const qs = [`cql=${encodeURIComponent(cql)}`];
  if (typeof limit === 'number') qs.push(`limit=${String(limit)}`);
  if (typeof start === 'number') qs.push(`start=${String(start)}`);
  if (expand && String(expand).trim()) qs.push(`expand=${encodeURIComponent(String(expand).trim())}`);
  const endpoint = `/search?${qs.join('&')}`;
  let lastResp = { ok: false, status: 0, body: null };
  for (const idx of orderByPreference()) {
    const path = `${BASES[idx]}${endpoint}`;
    const resp = await requestConfluenceJSON(path);
    lastResp = resp;
    if (resp.ok) {
      if (idx !== preferredBaseIndex) preferredBaseIndex = idx;
      return resp;
    }
    if (resp.status === 404 || resp.status === 410) {
      continue;
    }
    return resp;
  }
  return lastResp;
}

// Raw request helper (JSON-or-text body)
async function requestConfluenceRaw(path, options = {}) {
  const res = await asApp().requestConfluence(
    assumeTrustedRoute(path),
    options
  );
  const text = await res.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch (e) {}
  const ra = res.headers?.get?.('retry-after') || res.headers?.get?.('Retry-After');
  const retryAfterSec = ra ? Number(ra) : undefined;
  return { ok: res.ok, status: res.status, body, retryAfterSec };
}

export async function getContentPageBatch({ start = 0, limit = 100, expand = 'space,version,history,ancestors' } = {}) {
  const endpoint = `/content?type=page&status=current&limit=${String(limit)}&start=${String(start)}&expand=${expand}`;
  let lastResp = { ok: false, status: 0, body: null };
  for (const idx of orderByPreference()) {
    const path = `${BASES[idx]}${endpoint}`;
    console.warn('[Confluence][getContentPageBatch] try', { base: BASES[idx], start, limit });
    const resp = await requestConfluenceJSON(path);
    lastResp = resp;
    if (resp.ok) {
      if (idx !== preferredBaseIndex) preferredBaseIndex = idx;
      console.warn('[Confluence][getContentPageBatch] success', { base: BASES[idx], count: Array.isArray(resp.body?.results) ? resp.body.results.length : 'n/a' });
      return resp;
    }
    if (resp.status === 404 || resp.status === 410) {
      // try next base
      console.warn('[Confluence][getContentPageBatch] fallback to next base due to status', resp.status);
      continue;
    }
    console.warn('[Confluence][getContentPageBatch] aborting, non-fallbackable status', resp.status);
    return resp;
  }
  return lastResp;
}

export async function getContentPageBatchWithRetry(args, { retries = 5, baseDelay = 1200 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    console.warn('[Confluence][getContentPageBatchWithRetry] attempt', { attempt, args });
    const resp = await getContentPageBatch(args);
    if (resp.ok) return resp;
    if (resp.status === 429 || (resp.status >= 500 && resp.status < 600)) {
      const delay = typeof resp.retryAfterSec === 'number' && resp.retryAfterSec > 0
        ? resp.retryAfterSec * 1000
        : baseDelay * Math.pow(2, attempt);
      console.warn('Confluence GET retry', { start: args?.start, limit: args?.limit, status: resp.status, delay });
      await sleep(delay);
      continue;
    }
    console.warn('[Confluence][getContentPageBatchWithRetry] giving up with status', resp.status);
    return resp;
  }
  return { ok: false, status: 0, body: { message: 'retry failed' } };
}

// --- v2 Pages listing (cursor-based) ---
export async function getPagesBatchV2({ cursor = null, limit = 100 } = {}) {
  const qs = [];
  if (limit) qs.push(`limit=${String(limit)}`);
  if (cursor) qs.push(`cursor=${encodeURIComponent(cursor)}`);
  const endpoint = `/pages${qs.length ? `?${qs.join('&')}` : ''}`;
  let lastResp = { ok: false, status: 0, body: null };
  for (const idx of orderByPreferenceV2()) {
    const path = `${BASES_V2[idx]}${endpoint}`;
    console.warn('[Confluence][getPagesBatchV2] try', { base: BASES_V2[idx], hasCursor: !!cursor, limit });
    const resp = await requestConfluenceJSON(path);
    lastResp = resp;
    if (resp.ok) {
      if (idx !== preferredBaseIndexV2) preferredBaseIndexV2 = idx;
      const count = Array.isArray(resp.body?.results) ? resp.body.results.length : 'n/a';
      const next = resp.body?._links?.next || null;
      
      // DETAILED DEBUG LOGGING
      console.warn('[Confluence][getPagesBatchV2] success', { 
        base: BASES_V2[idx], 
        count, 
        hasNext: !!next,
        nextLink: next,
        _links: resp.body?._links,
        totalResults: resp.body?.size,
        limit: resp.body?.limit
      });
      
      return { ...resp, next };
    }
    if (resp.status === 404 || resp.status === 410) {
      console.warn('[Confluence][getPagesBatchV2] fallback to next base due to status', resp.status);
      continue;
    }
    console.warn('[Confluence][getPagesBatchV2] aborting, non-fallbackable status', resp.status);
    return resp;
  }
  return lastResp;
}

export async function getPagesBatchV2WithRetry(args, { retries = 5, baseDelay = 1200 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    console.warn('[Confluence][getPagesBatchV2WithRetry] attempt', { attempt, args });
    const resp = await getPagesBatchV2(args);
    if (resp.ok) return resp;
    if (resp.status === 429 || (resp.status >= 500 && resp.status < 600)) {
      const delay = typeof resp.retryAfterSec === 'number' && resp.retryAfterSec > 0
        ? resp.retryAfterSec * 1000
        : baseDelay * Math.pow(2, attempt);
      console.warn('Confluence GET retry (v2 pages)', { status: resp.status, delay });
      await sleep(delay);
      continue;
    }
    console.warn('[Confluence][getPagesBatchV2WithRetry] giving up with status', resp.status);
    return resp;
  }
  return { ok: false, status: 0, body: { message: 'retry failed' } };
}

// Cache spaceId -> key to avoid repeated lookups
const spaceKeyCache = new Map();

export async function getSpaceKeyById(spaceId, { retries = 3, baseDelay = 800 } = {}) {
  if (!spaceId) return { ok: false, key: undefined };
  const sid = String(spaceId);
  if (spaceKeyCache.has(sid)) {
    return { ok: true, key: spaceKeyCache.get(sid) };
  }
  let lastResp = { ok: false, status: 0, body: null };
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const idx of orderByPreferenceV2()) {
      const path = `${BASES_V2[idx]}/spaces/${encodeURIComponent(sid)}`;
      console.warn('[Confluence][getSpaceKeyById] try', { base: BASES_V2[idx], spaceId: sid });
      const resp = await requestConfluenceJSON(path);
      lastResp = resp;
      if (resp.ok && resp.body?.key) {
        if (idx !== preferredBaseIndexV2) preferredBaseIndexV2 = idx;
        spaceKeyCache.set(sid, resp.body.key);
        console.warn('[Confluence][getSpaceKeyById] success', { key: resp.body.key });
        return { ok: true, key: resp.body.key };
      }
      if (resp.status === 404 || resp.status === 410) continue;
      if (resp.status === 429 || (resp.status >= 500 && resp.status < 600)) {
        const delay = typeof resp.retryAfterSec === 'number' && resp.retryAfterSec > 0
          ? resp.retryAfterSec * 1000
          : baseDelay * Math.pow(2, attempt);
        console.warn('[Confluence][getSpaceKeyById] retry', { status: resp.status, delay });
        await sleep(delay);
        break;
      }
      return { ok: false, status: resp.status, body: resp.body };
    }
  }
  return { ok: false, status: lastResp.status, body: lastResp.body };
}

export { sleep };

export async function hasChildPages(pageId) {
  // Prefer v2 filter by parentId which is widely supported
  const endpoint = `/pages?parentId=${encodeURIComponent(pageId)}&limit=1`;
  let lastResp = { ok: false, status: 0, body: null };
  for (const idx of orderByPreferenceV2()) {
    const path = `${BASES_V2[idx]}${endpoint}`;
    console.warn('[Confluence][hasChildPages] try', { base: BASES_V2[idx], pageId });
    const resp = await requestConfluenceJSON(path);
    lastResp = resp;
    if (resp.ok) {
      if (idx !== preferredBaseIndexV2) preferredBaseIndexV2 = idx;
      const results = Array.isArray(resp.body?.results) ? resp.body.results : [];
      console.warn('[Confluence][hasChildPages] success', { base: BASES_V2[idx], size: results.length });
      return { ok: true, hasChild: results.length > 0 };
    }
    if (resp.status === 404 || resp.status === 410) continue; // try alternate base
    console.warn('[Confluence][hasChildPages] aborting with status', resp.status);
    return { ok: false, status: resp.status, hasChild: false, body: resp.body };
  }
  return { ok: false, status: lastResp.status, hasChild: false, body: lastResp.body };
}

// Archive a page using Confluence Cloud API v2
export async function archivePage(pageId, { retries = 5, baseDelay = 1200 } = {}) {
  const endpoint = `/pages/${encodeURIComponent(pageId)}/archive`;
  let lastResp = { ok: false, status: 0, body: null };
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const idx of orderByPreferenceV2()) {
      const path = `${BASES_V2[idx]}${endpoint}`;
      const resp = await requestConfluenceRaw(path, { method: 'POST' });
      lastResp = resp;
      if (resp.ok || resp.status === 204) {
        if (idx !== preferredBaseIndexV2) preferredBaseIndexV2 = idx;
        return { ok: true };
      }
      if (resp.status === 404 || resp.status === 410) {
        // try next base
        continue;
      }
      if (resp.status === 429 || (resp.status >= 500 && resp.status < 600)) {
        const delay = typeof resp.retryAfterSec === 'number' && resp.retryAfterSec > 0
          ? resp.retryAfterSec * 1000
          : baseDelay * Math.pow(2, attempt);
        await sleep(delay);
        break; // retry same index order next attempt
      }
      return { ok: false, status: resp.status, body: resp.body };
    }
  }
  return { ok: false, status: lastResp.status, body: lastResp.body };
}

// Add one or more global labels to a page (REST v1)
export async function addLabels(pageId, labels = [], { retries = 5, baseDelay = 1200 } = {}) {
  const endpoint = `/content/${encodeURIComponent(pageId)}/label`;
  const payload = labels.map((name) => ({ prefix: 'global', name }));
  let lastResp = { ok: false, status: 0, body: null };
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const idx of orderByPreference()) {
      const path = `${BASES[idx]}${endpoint}`;
      const resp = await requestConfluenceRaw(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      lastResp = resp;
      if (resp.ok || resp.status === 204) {
        if (idx !== preferredBaseIndex) preferredBaseIndex = idx;
        return { ok: true };
      }
      if (resp.status === 404 || resp.status === 410) continue;
      if (resp.status === 429 || (resp.status >= 500 && resp.status < 600)) {
        const delay = typeof resp.retryAfterSec === 'number' && resp.retryAfterSec > 0
          ? resp.retryAfterSec * 1000
          : baseDelay * Math.pow(2, attempt);
        await sleep(delay);
        break;
      }
      return { ok: false, status: resp.status, body: resp.body };
    }
  }
  return { ok: false, status: lastResp.status, body: lastResp.body };
}

// Upsert content property (REST v1): tries PUT, falls back to POST
export async function setContentProperty(pageId, key, value, { retries = 5, baseDelay = 1200 } = {}) {
  const putEndpoint = (base) => `${base}/content/${encodeURIComponent(pageId)}/property/${encodeURIComponent(key)}`;
  const postEndpoint = (base) => `${base}/content/${encodeURIComponent(pageId)}/property`;
  const postBody = { key, value };
  let lastResp = { ok: false, status: 0, body: null };
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const idx of orderByPreference()) {
      const base = BASES[idx];
      // Try PUT first
      let resp = await requestConfluenceRaw(putEndpoint(base), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      lastResp = resp;
      if (resp.ok) {
        if (idx !== preferredBaseIndex) preferredBaseIndex = idx;
        return { ok: true };
      }
      if (resp.status === 404) {
        // Try POST create
        resp = await requestConfluenceRaw(postEndpoint(base), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postBody),
        });
        lastResp = resp;
        if (resp.ok) {
          if (idx !== preferredBaseIndex) preferredBaseIndex = idx;
          return { ok: true };
        }
      }
      if (resp.status === 410) continue;
      if (resp.status === 429 || (resp.status >= 500 && resp.status < 600)) {
        const delay = typeof resp.retryAfterSec === 'number' && resp.retryAfterSec > 0
          ? resp.retryAfterSec * 1000
          : baseDelay * Math.pow(2, attempt);
        await sleep(delay);
        break;
      }
      return { ok: false, status: resp.status, body: resp.body };
    }
  }
  return { ok: false, status: lastResp.status, body: lastResp.body };
}
