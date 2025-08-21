import React from 'react';
import { invoke } from '@forge/bridge';
import { friendlyError } from '../utils/friendlyError';
import { downloadFile } from '../utils/download';


export const useDetectedPages = () => {
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState('');
  const [minImpact, setMinImpact] = React.useState(0);
  const [status, setStatus] = React.useState('detected');
  const [flags, setFlags] = React.useState({ stale: false, inactive: false, orphaned: false, incomplete: false });
  const [sortBy, setSortBy] = React.useState('impact');
  const [sortDir, setSortDir] = React.useState('desc');
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState(new Set());
  const [action, setAction] = React.useState(null);
  const [dryRun, setDryRun] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  const [exportData, setExportData] = React.useState(null);

  const [exporting, setExporting] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await invoke('listDetectedPages', {
        search,
        minImpact: Number(minImpact) || 0,
        status,
        flags,
        page,
        pageSize,
        sortBy: sortBy === 'updated' ? 'updated' : 'impact',
        sortDir,
      });
      if (res?.ok) {
        setItems(res.results || res.items || []);
        setTotal(res.total || 0);
      } else {
        setItems([]);
        setTotal(0);
        setError(friendlyError(res?.error || 'Failed to load'));
      }
    } catch (e) {
      setItems([]);
      setTotal(0);
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [search, minImpact, status, flags, page, pageSize, sortBy, sortDir]);

  React.useEffect(() => {
    load();
  }, [load]);

  const toggleAll = (checked) => {
    if (checked) setSelected(new Set(items.map((x) => x.id)));
    else setSelected(new Set());
  };

  const toggleOne = (id, checked) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const doDryRun = async () => {
    setError(null);
    try {
      const res = await invoke('dryRunAction', {
        pageIds: Array.from(selected),
        action,
      });
      setDryRun(res);
    } catch (e) {
      setError(friendlyError(e));
    }
  };

  const applyAction = async (reason) => {
    try {
      const res = await invoke('applyBulkAction', {
        pageIds: Array.from(selected),
        action,
        reason: reason || 'bulk from UI',
      });
      if (res?.ok) {
        setDryRun(null);
        setSelected(new Set());
        await load();
      } else {
        setError(res?.error || 'Action failed');
      }
    } catch (e) {
      setError(String(e));
    }
  };

  const openExport = async (format, onlySelected = false) => {
    setMessage(null);
    setExporting(true);
    try {
      const payload = {
        search,
        minImpact: Number(minImpact) || 0,
        status,
        flags,
        sortBy,
        sortDir,
      };
      if (onlySelected) payload.ids = Array.from(selected);
      const res = await invoke('exportDetectedPages', payload);
      if (res?.ok) setExportData(res);
      else setMessage({ appearance: 'error', text: friendlyError(res?.error || 'Export failed') });
    } catch (e) {
      setMessage({ appearance: 'error', text: friendlyError(e) });
    } finally {
      setExporting(false);
    }
  };

  const downloadFromModal = async (format) => {
    if (!exportData) return;
    if (format === 'csv') {
      await downloadFile({ content: exportData.csv, mime: 'text/csv;charset=utf-8;', ext: 'csv', baseName: 'content-guardian-detected', setMessage });
    } else {
      await downloadFile({ content: exportData.excelHtml, mime: 'application/vnd.ms-excel', ext: 'xls', baseName: 'content-guardian-detected', setMessage });
    }
  };

  const onSort = (key, dir) => {
    setSortBy(key);
    setSortDir(dir);
  };

  return {
    items,
    total,
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    minImpact,
    setMinImpact,
    status,
    setStatus,
    flags,
    setFlags,
    sortBy,
    sortDir,
    loading,
    load,
    selected,
    toggleAll,
    toggleOne,
    action,
    setAction,
    dryRun,
    setDryRun,
    doDryRun,
    applyAction,
    error,
    exportData,
    setExportData,
    openExport,
    downloadFromModal,
    onSort,
    message,
    exporting,
  };
};
