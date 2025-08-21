import React from 'react';
import { invoke } from '@forge/bridge';

// Lazy loads page owners for given items and caches results in-memory
export const useOwnersLazy = (items) => {
  const [owners, setOwners] = React.useState({}); // { [id]: { displayName, accountId } | null }
  const [loadingIds, setLoadingIds] = React.useState(new Set());
  const inflightRef = React.useRef(new Set());

  const fetchOwners = React.useCallback(async (ids) => {
    const unique = Array.from(new Set((ids || []).map(String))).filter(Boolean);
    if (unique.length === 0) return;

    // prevent duplicate concurrent calls for the same IDs
    const pending = unique.filter((id) => !inflightRef.current.has(id));
    if (pending.length === 0) return;

    pending.forEach((id) => inflightRef.current.add(id));
    setLoadingIds((prev) => new Set([...Array.from(prev), ...pending]));
    try {
      const res = await invoke('getPageOwners', { ids: pending });
      if (res?.ok && res?.owners) {
        setOwners((prev) => ({ ...prev, ...res.owners }));
      }
    } catch (_) {
      // ignore, keep cache as is
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        pending.forEach((id) => next.delete(id));
        return next;
      });
      pending.forEach((id) => inflightRef.current.delete(id));
    }
  }, []);

  React.useEffect(() => {
    const ids = (items || []).map((x) => x?.id).filter(Boolean).map(String);
    if (ids.length === 0) return;
    const missing = ids.filter((id) => typeof owners[id] === 'undefined');
    if (missing.length > 0) {
      // batch up to 50 IDs per call to be safe
      const batch = missing.slice(0, 50);
      fetchOwners(batch);
    }
  }, [items, owners, fetchOwners]);

  return { owners, loadingIds, fetchOwners };
};
