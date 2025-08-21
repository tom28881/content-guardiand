import { STORAGE_KEYS, getIndex, getMany, getAuditLog } from '../storage';
import { csvEsc } from '../utils/format';

export function registerAuditResolvers(resolver) {
  resolver.define('listAuditLog', async ({ payload }) => {
    return getAuditLog(payload);
  });

  resolver.define('exportAuditLog', async () => {
    const idx = await getIndex(STORAGE_KEYS.AUDIT_INDEX);
    if (idx.length === 0) {
      return { ok: true, csv: 'id,ts,action,pageId,title,spaceKey,reason', total: 0 };
    }

    const keysToFetch = idx.map((id) => `audit:${id}`);
    const itemsObject = await getMany(keysToFetch);
    const items = Object.values(itemsObject).filter(Boolean);
    const header = 'id,ts,action,pageId,title,spaceKey,reason';
    const lines = [
      header,
      ...items.map((e) =>
        [e.id, e.ts, e.action, e.pageId, e.title, e.spaceKey, e.reason]
          .map(csvEsc)
          .join(',')
      ),
    ];
    const csv = lines.join('\n');
    return { ok: true, csv, total: idx.length };
  });
}
