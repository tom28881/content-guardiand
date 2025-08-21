import { storage } from '@forge/api';
import { STORAGE_KEYS, getIndex, getMany } from '../storage';
import { isoWeekLabel } from '../utils/date';
import { searchCQL, contentSearchCQL } from './confluence';

export async function getDashboardData() {
  try {
    const lastScan = await storage.get(STORAGE_KEYS.LAST_SCAN);
    const idx = await getIndex(STORAGE_KEYS.DETECTED_INDEX);
    const total = idx.length;
    console.warn('[dashboard] start', { indexCount: total, lastScan });

    const countByStatus = { detected: 0, archived: 0, whitelisted: 0, tagged: 0 };
    const flagKeys = ['stale', 'inactive', 'orphaned', 'incomplete'];
    const countByFlag = { stale: 0, inactive: 0, orphaned: 0, incomplete: 0 };
    const primaryPriority = ['stale', 'orphaned', 'incomplete', 'inactive'];
    const countByPrimary = { stale: 0, inactive: 0, orphaned: 0, incomplete: 0 };
    const weekMap = new Map();
    const weekImpactSum = new Map();
    const weekImpactCnt = new Map();
    const spaceAgg = new Map(); // spaceKey -> { count, impactSum, flagCounts: { stale, inactive, orphaned, incomplete } }
    let sumImpact = 0;

    const CHUNK = 100;
    for (let i = 0; i < idx.length; i += CHUNK) {
      const ids = idx.slice(i, i + CHUNK);
      const keys = ids.map((id) => `detected:${id}`);
      const batchMap = await getMany(keys);
      const batch = keys.map((k) => batchMap[k]).filter(Boolean);
      for (const it of batch) {
        if (!it) continue;
        const st = it.status || 'detected';
        if (countByStatus[st] === undefined) countByStatus[st] = 0;
        countByStatus[st]++;

        const f = it.flags || {};
        for (const k of flagKeys) if (f[k]) countByFlag[k]++;
        const pk = primaryPriority.find((k) => !!f[k]);
        if (pk) countByPrimary[pk]++;

        const label = isoWeekLabel(it.createdAt || it.lastUpdated || new Date().toISOString());
        weekMap.set(label, (weekMap.get(label) || 0) + 1);
        sumImpact += it.impactScore || 0;

        // Weekly average impact helpers
        const prevSum = weekImpactSum.get(label) || 0;
        const prevCnt = weekImpactCnt.get(label) || 0;
        weekImpactSum.set(label, prevSum + (Number(it.impactScore) || 0));
        weekImpactCnt.set(label, prevCnt + 1);

        // Space aggregation
        const sk = it.spaceKey || '(unknown)';
        const agg = spaceAgg.get(sk) || { count: 0, impactSum: 0, flagCounts: { stale: 0, inactive: 0, orphaned: 0, incomplete: 0 } };
        agg.count += 1;
        agg.impactSum += Number(it.impactScore) || 0;
        for (const k of flagKeys) if (f[k]) agg.flagCounts[k] += 1;
        spaceAgg.set(sk, agg);
      }
    }

    const allWeeks = Array.from(weekMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const weeklyTrendAA = allWeeks.slice(-12);
    const avgImpact = total ? Math.round(sumImpact / total) : 0;

    // Weekly average impact series
    const weeklyAvgImpactAA = Array.from(weekImpactSum.keys())
      .map((w) => [w, Math.round((weekImpactSum.get(w) || 0) / Math.max(1, weekImpactCnt.get(w) || 0))])
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12);

    // Problem spaces aggregation: top 8 by count
    const problemSpacesAA = Array.from(spaceAgg.entries())
      .map(([spaceKey, v]) => {
        const topFlag = flagKeys
          .map((k) => [k, v.flagCounts[k]])
          .sort((a, b) => b[1] - a[1])[0];
        const topFlagKey = topFlag && topFlag[1] > 0 ? topFlag[0] : null;
        return [spaceKey, v.count, v.count ? Math.round(v.impactSum / v.count) : 0, topFlagKey];
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // Problem pages count (highlight KPI)
    const problemPagesCount = (countByStatus.detected || 0) + (countByStatus.tagged || 0);

    // Fetch Confluence-wide totals asynchronously (best-effort)
    let totalPages = null;
    let activeUsers30d = null;
    let activeUsersOk = false;
    try {
      const cqlTotal = 'type=page AND status=current';
      const resTotal = await searchCQL({ cql: cqlTotal, limit: 1, start: 0 });
      if (resTotal?.ok) {
        const body = resTotal.body || {};
        const ts = body.totalSize ?? body.totalsize ?? body.size ?? body.total ?? null;
        totalPages = typeof ts === 'number' ? ts : null;
      }
    } catch (e) {
      console.warn('[getDashboard] totalPages fetch failed (ignored)', e?.message || e);
    }
    try {
      // Approximate active editors in last 30 days by distinct accountId on lastUpdated
      const editors = new Set();
      const limit = 100;
      for (let start = 0; start < 1000; start += limit) {
        const cqlActive = 'type=page AND lastmodified >= now("-30d")';
        const resAct = await contentSearchCQL({ cql: cqlActive, limit, start, expand: 'history.lastUpdated' });
        if (!resAct?.ok) break;
        const results = resAct.body?.results || [];
        for (const r of results) {
          const acc = r?.history?.lastUpdated?.by?.accountId || r?.version?.by?.accountId;
          if (acc) editors.add(String(acc));
        }
        if (results.length < limit) break;
      }
      activeUsers30d = editors.size;
      activeUsersOk = true;
    } catch (e) {
      console.warn('[getDashboard] activeUsers30d fetch failed (ignored)', e?.message || e);
    }

    const statusBreakdownAA = [
      ['Detected', countByStatus.detected],
      ['Archived', countByStatus.archived],
      ['Whitelisted', countByStatus.whitelisted],
      ['Tagged', countByStatus.tagged],
    ];
    const flagsBreakdownAA = [
      ['Stale', countByFlag.stale],
      ['Inactive', countByFlag.inactive],
      ['Orphaned', countByFlag.orphaned],
      ['Incomplete', countByFlag.incomplete],
    ];
    const flagsPrimaryBreakdownAA = [
      ['Stale', countByPrimary.stale],
      ['Inactive', countByPrimary.inactive],
      ['Orphaned', countByPrimary.orphaned],
      ['Incomplete', countByPrimary.incomplete],
    ];

    console.warn('[getDashboard] totals', { total, status: countByStatus, flags: countByFlag, weeks: weeklyTrendAA.length, avgImpact });

    return {
      ok: true,
      total,
      archived: countByStatus.archived,
      whitelisted: countByStatus.whitelisted,
      avgImpact,
      lastScan,
      totalPages,
      activeUsers30d,
      activeUsersOk,
      problemPagesCount,
      statusBreakdownAA,
      flagsBreakdownAA,
      flagsPrimaryBreakdownAA,
      weeklyTrendAA,
      weeklyAvgImpactAA,
      problemSpacesAA,
    };
  } catch (e) {
    console.error('getDashboard error', e);
    return { ok: false, error: String(e?.message || e) };
  }
}
