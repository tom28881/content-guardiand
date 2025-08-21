import { asUser, asApp, assumeTrustedRoute } from '@forge/api';
import { getDetectedPages } from '../storage';
import { csvEsc, htmlEsc } from '../utils/format';

export function registerDetectedResolvers(resolver) {
  resolver.define('listDetectedPages', async ({ payload }) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        status,
        flags,
        search,
        minImpact,
        sortBy,
        sortDir,
        filters: inputFilters,
      } = payload || {};

      const filters = {};
      if (inputFilters && typeof inputFilters === 'object') {
        if (inputFilters.status) filters.status = inputFilters.status;
        if (Array.isArray(inputFilters.flags) && inputFilters.flags.length) filters.flags = [...new Set(inputFilters.flags)];
        if (typeof inputFilters.minImpact !== 'undefined') filters.minImpact = Number(inputFilters.minImpact) || 0;
        if (inputFilters.search) filters.search = String(inputFilters.search);
      }
      if (status && status !== 'any') filters.status = filters.status ?? status;
      if (flags && typeof flags === 'object') {
        const enabledFlags = Object.entries(flags)
          .filter(([, v]) => !!v)
          .map(([k]) => k);
        if (enabledFlags.length) {
          const existing = new Set(filters.flags || []);
          enabledFlags.forEach((f) => existing.add(f));
          filters.flags = Array.from(existing);
        }
      }
      if (typeof minImpact !== 'undefined') filters.minImpact = Number(minImpact) || 0;
      if (search) filters.search = String(search);

      const callArgs = { page, pageSize, filters };
      if (sortBy) callArgs.sortBy = sortBy;
      if (sortDir) callArgs.sortDir = sortDir;
      const { results, total } = await getDetectedPages(callArgs);
      return { ok: true, results, total };
    } catch (e) {
      console.error('[listDetectedPages] error', e);
      return { ok: false, error: e.message, results: [], total: 0 };
    }
  });

  resolver.define('exportDetectedPages', async ({ payload }) => {
    const { status, flags, search, minImpact, sortBy, sortDir, filters: inputFilters, ids = [] } = payload || {};

    try {
      const filters = {};
      if (inputFilters && typeof inputFilters === 'object') {
        if (inputFilters.status) filters.status = inputFilters.status;
        if (Array.isArray(inputFilters.flags) && inputFilters.flags.length) filters.flags = [...new Set(inputFilters.flags)];
        if (typeof inputFilters.minImpact !== 'undefined') filters.minImpact = Number(inputFilters.minImpact) || 0;
        if (inputFilters.search) filters.search = String(inputFilters.search);
      }
      if (status && status !== 'any') filters.status = filters.status ?? status;
      if (flags && typeof flags === 'object') {
        const enabledFlags = Object.entries(flags)
          .filter(([, v]) => !!v)
          .map(([k]) => k);
        if (enabledFlags.length) {
          const existing = new Set(filters.flags || []);
          enabledFlags.forEach((f) => existing.add(f));
          filters.flags = Array.from(existing);
        }
      }
      if (typeof minImpact !== 'undefined') filters.minImpact = Number(minImpact) || 0;
      if (search) filters.search = String(search);

      const listArgs = { page: 1, pageSize: 10000, filters };
      if (sortBy) listArgs.sortBy = sortBy;
      if (sortDir) listArgs.sortDir = sortDir;
      let { results: items } = await getDetectedPages(listArgs);
      if (Array.isArray(ids) && ids.length) {
        const set = new Set(ids.map(String));
        items = items.filter((it) => set.has(String(it.id)));
      }

      if (items.length === 0) {
        return { ok: true, total: 0, csv: '', excelHtml: '' };
      }

      const toBool = (v) => (v ? 'true' : 'false');
      const header = 'id,title,spaceKey,impactScore,lastUpdated,status,stale,inactive,orphaned,incomplete';
      const csvLines = [
        header,
        ...items.map((it) =>
          [
            it.id,
            it.title,
            it.spaceKey,
            it.impactScore ?? 0,
            it.lastUpdated,
            it.status || 'detected',
            toBool(it.flags?.stale),
            toBool(it.flags?.inactive),
            toBool(it.flags?.orphaned),
            toBool(it.flags?.incomplete),
          ]
            .map(csvEsc)
            .join(',')
        ),
      ];
      const csv = csvLines.join('\n');

      const tableRows = items
        .map(
          (it) =>
            `<tr>` +
            `<td>${htmlEsc(it.id)}</td>` +
            `<td>${htmlEsc(it.title)}</td>` +
            `<td>${htmlEsc(it.spaceKey)}</td>` +
            `<td>${htmlEsc(it.impactScore ?? 0)}</td>` +
            `<td>${htmlEsc(it.lastUpdated)}</td>` +
            `<td>${htmlEsc(it.status || 'detected')}</td>` +
            `<td>${toBool(it.flags?.stale)}</td>` +
            `<td>${toBool(it.flags?.inactive)}</td>` +
            `<td>${toBool(it.flags?.orphaned)}</td>` +
            `<td>${toBool(it.flags?.incomplete)}</td>` +
            `</tr>`
        )
        .join('');

      const excelHtml = `<html><body><table><thead><tr>${header
        .split(',')
        .map((h) => `<th>${htmlEsc(h)}</th>`) 
        .join('')}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

      return { ok: true, total: items.length, csv, excelHtml };
    } catch (e) {
      console.error('[exportDetectedPages] error', e);
      return { ok: false, error: e.message };
    }
  });

  // Lazy fetch page owners (last updater or creator) for given IDs
  resolver.define('getPageOwners', async ({ payload }) => {
    try {
      const ids = Array.isArray(payload?.ids) ? payload.ids : [];
      if (!ids.length) return { ok: true, owners: {} };

      const requestJSON = async (path) => {
        const doReq = async (actor = 'app') => {
          const client = actor === 'user' ? asUser().requestConfluence : asApp().requestConfluence;
          const res = await client(assumeTrustedRoute(path));
          const text = await res.text();
          let body;
          try { body = JSON.parse(text); } catch (_) { body = {}; }
          return { ok: res.ok, status: res.status, body };
        };
        let resp = await doReq('app');
        if (!resp.ok && [401, 403, 404, 410].includes(resp.status)) {
          try {
            const alt = await doReq('user');
            if (alt.ok || alt.status !== resp.status) resp = alt;
          } catch (_) {}
        }
        return resp;
      };

      const fetchOwner = async (id) => {
        const pid = String(id);
        try {
          const pagePath = `/wiki/api/v2/pages/${encodeURIComponent(pid)}`;
          const pageRes = await requestJSON(pagePath);

          if (pageRes.ok) {
            const pageBody = pageRes.body;
            const ownerAccountId = pageBody?.version?.authorId || pageBody?.authorId;
            const pageBaseUrl = pageBody?._links?.base;

            if (ownerAccountId) {
              const userPath = `/wiki/rest/api/user?accountId=${encodeURIComponent(ownerAccountId)}`;
              const userRes = await requestJSON(userPath);

              if (userRes.ok) {
                const userBody = userRes.body;
                const displayName = userBody.publicName || userBody.displayName || ownerAccountId;
                const profileUrl = pageBaseUrl ? `${pageBaseUrl}/people/${ownerAccountId}` : null;
                return { id: pid, owner: { displayName, accountId: ownerAccountId, profileUrl } };
              }
            }
          }
        } catch (e) {
          // fall through
        }
        return { id, owner: null };
      };

      const results = await Promise.all(ids.map(fetchOwner));
      const owners = {};
      for (const r of results) {
        if (r && r.id) owners[r.id] = r.owner;
      }
      return { ok: true, owners };
    } catch (e) {
      console.error('[getPageOwners] error', e);
      return { ok: false, error: e.message, owners: {} };
    }
  });
}
