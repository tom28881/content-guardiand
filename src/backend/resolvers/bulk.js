import { storage } from '@forge/api';
import { archivePage, addLabels, setContentProperty } from '../services/confluence';
import { addAuditLogEntry } from '../storage';

export function registerBulkResolvers(resolver) {
  resolver.define('dryRunAction', async ({ payload }) => {
    const { pageIds = [], action } = payload || {};
    const items = [];
    for (const id of pageIds) {
      // eslint-disable-next-line no-await-in-loop
      const item = await storage.get(`detected:${id}`);
      if (item) items.push(item);
    }
    let warnings = 0;
    if (action === 'archive') warnings = items.filter((x) => x.status === 'archived').length;
    return { ok: true, counts: { selected: items.length, warnings }, action };
  });

  resolver.define('applyBulkAction', async ({ payload, context }) => {
    const { accountId } = context;
    const { pageIds = [], action, reason = '' } = payload || {};
    const now = new Date().toISOString();
    const errors = [];
    let updated = 0;

    if (!['archive', 'whitelist', 'tag'].includes(action)) {
      return { ok: false, error: `Unsupported action: ${String(action)}` };
    }

    const labelByAction = {
      archive: 'content-guardian-archived',
      whitelist: 'content-guardian-whitelist',
      tag: 'content-guardian-keep',
    };

    for (const id of pageIds) {
      try {
        const key = `detected:${id}`;
        // eslint-disable-next-line no-await-in-loop
        const item = await storage.get(key);
        if (!item) continue;

        let newStatus = item.status;
        if (action === 'archive') newStatus = 'archived';
        else if (action === 'whitelist') newStatus = 'whitelisted';
        else if (action === 'tag') newStatus = 'tagged';

        // Only perform remote actions when changing status
        let remoteOk = true;
        if (newStatus !== item.status) {
          if (action === 'archive') {
            // eslint-disable-next-line no-await-in-loop
            const res = await archivePage(id);
            remoteOk = !!res?.ok;
            if (!remoteOk) {
              errors.push({ id, action, stage: 'archive', error: res });
            }
          }
          if (remoteOk) {
            const label = labelByAction[action];
            if (label) {
              // eslint-disable-next-line no-await-in-loop
              const lr = await addLabels(id, [label]);
              if (!lr?.ok) {
                errors.push({ id, action, stage: 'label', error: lr });
              }
            }
            // eslint-disable-next-line no-await-in-loop
            const pr = await setContentProperty(id, 'content-guardian', {
              action,
              reason,
              at: now,
            });
            if (!pr?.ok) {
              errors.push({ id, action, stage: 'property', error: pr });
            }
          }

          if (remoteOk) {
            item.status = newStatus;
            item.statusAt = now;
            // eslint-disable-next-line no-await-in-loop
            await storage.set(key, item);
            updated++;
          }
        }

        // Always write audit log entry
        // eslint-disable-next-line no-await-in-loop
        await addAuditLogEntry({
          action: payload.action,
          status: 'success',
          pageId: item.id,
          pageTitle: item.title,
          spaceKey: item.spaceKey,
          user: accountId,
          details: `Action '${payload.action}' applied successfully.`,
        });
      } catch (e) {
        errors.push({ id, action, stage: 'exception', error: String(e) });
        // eslint-disable-next-line no-await-in-loop
        await addAuditLogEntry({
          action: payload.action,
          status: 'failure',
          pageId: id,
          pageTitle: '',
          spaceKey: '',
          user: accountId,
          details: `Action '${payload.action}' failed with error: ${String(e)}`,
        });
      }
    }
    return { ok: true, updated, errors };
  });
}
