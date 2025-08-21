import React from 'react';
import { Box, Spinner, SectionMessage, Text, PieChart, Inline, Heading, Button } from '@forge/react';
import { invoke } from '@forge/bridge';

import { useDetectedPages } from '../hooks/useDetectedPages';
import FilterBar from '../components/controls/FilterBar';
import ActionBar from '../components/controls/ActionBar';
import DetectedTable from '../components/DetectedTable';
import Pagination from '../components/Pagination';
import ModalDryRun from '../components/ModalDryRun';
import ModalExport from '../components/ModalExport';
import ModalReset from '../components/ModalReset';
import { useOwnersLazy } from '../hooks/useOwnersLazy';
import ColumnsToggle from '../components/controls/ColumnsToggle';

const DetectedPages = ({ initialFilters, onInitialFiltersConsumed }) => {
  const {
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
  } = useDetectedPages();

  // Apply initial filters coming from Dashboard navigation
  React.useEffect(() => {
    if (!initialFilters) return;
    const f = initialFilters || {};
    if (typeof f.search === 'string') setSearch(f.search);
    if (typeof f.minImpact !== 'undefined' && f.minImpact !== null) setMinImpact(Number(f.minImpact) || 0);
    if (typeof f.status === 'string') setStatus(f.status);
    if (Array.isArray(f.flags)) {
      const obj = { stale: false, inactive: false, orphaned: false, incomplete: false };
      for (const k of f.flags) if (obj.hasOwnProperty(k)) obj[k] = true;
      setFlags(obj);
    } else if (f.flags && typeof f.flags === 'object') {
      setFlags({
        stale: !!f.flags.stale,
        inactive: !!f.flags.inactive,
        orphaned: !!f.flags.orphaned,
        incomplete: !!f.flags.incomplete,
      });
    }
    setPage(1);
    if (typeof onInitialFiltersConsumed === 'function') onInitialFiltersConsumed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters]);

  // Local state for reset flow
  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetError, setResetError] = React.useState(null);
  const [localMessage, setLocalMessage] = React.useState(null);

  // Lazy owners for current items
  const { owners, loadingIds: ownerLoadingIds } = useOwnersLazy(items);

  // Row-level actions loading state
  const [rowLoadingIds, setRowLoadingIds] = React.useState(new Set());
  const onRowAction = async (id, act) => {
    setLocalMessage(null);
    setRowLoadingIds((prev) => new Set([...Array.from(prev), String(id)]));
    try {
      const res = await invoke('applyBulkAction', { pageIds: [id], action: act, reason: 'inline row action' });
      if (res?.ok) {
        setLocalMessage({ appearance: 'information', text: `Action '${act}' applied to page ${id}.` });
        await load();
      } else {
        setLocalMessage({ appearance: 'error', text: `Failed to apply '${act}' to page ${id}: ${res?.error || 'Unknown error'}` });
      }
    } catch (e) {
      setLocalMessage({ appearance: 'error', text: String(e?.message || e) });
    } finally {
      setRowLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(String(id));
        return next;
      });
    }
  };

  // Column visibility (persist locally in browser)
  const [visibleColumns, setVisibleColumns] = React.useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('cg_detected_columns');
        if (raw) return JSON.parse(raw);
      }
    } catch (_) {}
    return { title: true, space: true, owner: true, impact: true, updated: true, status: true, actions: true };
  });
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('cg_detected_columns', JSON.stringify(visibleColumns));
      }
    } catch (_) {}
  }, [visibleColumns]);

  const startReset = () => {
    setResetError(null);
    setResetOpen(true);
  };

  const confirmReset = async (reason) => {
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await invoke('resetDetected', { confirm: 'RESET', reason: reason || 'manual reset from UI' });
      if (!res?.ok) {
        throw new Error(res?.error || 'Reset failed');
      }
      setResetOpen(false);
      setLocalMessage({ appearance: 'information', text: `Reset completed. Removed ${res.removed || 0} items.` });
      await load();
    } catch (e) {
      setResetError(String(e.message || e));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box padding="space.200">
        {error && (
          <SectionMessage title="Error" appearance="error">
            <Text>{error}</Text>
          </SectionMessage>
        )}
        {(message || localMessage) && (
          <SectionMessage title="Info" appearance={(message?.appearance || localMessage?.appearance || 'information')}>
            <Text>{message?.text || localMessage?.text}</Text>
          </SectionMessage>
        )}

        <FilterBar
          search={search}
          setSearch={setSearch}
          minImpact={minImpact}
          setMinImpact={setMinImpact}
          status={status}
          setStatus={setStatus}
          flags={flags}
          setFlags={setFlags}
        />

        <ActionBar
          action={action}
          setAction={setAction}
          selectedCount={selected.size}
          onDryRun={doDryRun}
          onExportCsv={() => openExport('csv', false)}
          onExportExcel={() => openExport('excel', false)}
          onExportSelectedCsv={() => openExport('csv', true)}
          onExportSelectedExcel={() => openExport('excel', true)}
          exporting={exporting}
          onReset={startReset}
        />

        {/* Přepínače viditelnosti sloupců */}
        <ColumnsToggle value={visibleColumns} onChange={setVisibleColumns} />

        {/* Flags breakdown for current page of results */}
        <Box paddingBlock="space.200">
          <Heading size="small">Flags Breakdown (current page)</Heading>
          {items && items.length > 0 ? (
            <Inline alignBlock="center" space="space.300">
              <PieChart
                data={(function() {
                  const counts = { stale: 0, inactive: 0, orphaned: 0, incomplete: 0 };
                  for (const it of items) {
                    if (it?.flags?.stale) counts.stale++;
                    if (it?.flags?.inactive) counts.inactive++;
                    if (it?.flags?.orphaned) counts.orphaned++;
                    if (it?.flags?.incomplete) counts.incomplete++;
                  }
                  return [
                    { type: 'stale', label: 'Stale', value: counts.stale },
                    { type: 'inactive', label: 'Inactive', value: counts.inactive },
                    { type: 'orphaned', label: 'Orphaned', value: counts.orphaned },
                    { type: 'incomplete', label: 'Incomplete', value: counts.incomplete },
                  ];
                })()}
                width={320}
                labelAccessor="label"
                valueAccessor="value"
                colorAccessor="type"
              />
            </Inline>
          ) : (
            <Text>No items to visualise.</Text>
          )}
        </Box>

        {loading ? (
          <Box padding="space.400">
            <Spinner size="large" />
          </Box>
        ) : (
          <DetectedTable
            items={items}
            selected={selected}
            onToggleAll={toggleAll}
            onToggleOne={toggleOne}
            onSort={onSort}
            sortBy={sortBy}
            sortDir={sortDir}
            loading={loading}
            owners={owners}
            onRowAction={onRowAction}
            rowLoadingIds={rowLoadingIds}
            visibleColumns={visibleColumns}
            ownerLoadingIds={ownerLoadingIds}
          />
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
        />

        {dryRun && (
          <ModalDryRun
            dryRun={dryRun}
            action={action}
            onClose={() => setDryRun(null)}
            onConfirm={applyAction}
            loading={loading}
          />
        )}

        {exportData && (
          <ModalExport
            exportData={exportData}
            onClose={() => setExportData(null)}
            onDownload={downloadFromModal}
            exporting={exporting}
          />
        )}

        <ModalReset
          open={resetOpen}
          onClose={() => setResetOpen(false)}
          onConfirm={confirmReset}
          loading={resetLoading}
          error={resetError}
        />
    </Box>
  );
};

export default DetectedPages;
