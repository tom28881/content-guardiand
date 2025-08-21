import React from 'react';
import PropTypes from 'prop-types';
import { DynamicTable, Text, Checkbox, Button, Inline, Link } from '@forge/react';
import StatusBadge from './badges/StatusBadge';
import ImpactBadge from './badges/ImpactBadge';

export default function DetectedTable({
  items,
  loading,
  selected,
  onToggleAll,
  onToggleOne,
  sortBy,
  sortDir,
  onSort,
  owners = {},
  onRowAction,
  rowLoadingIds = new Set(),
  visibleColumns,
  ownerLoadingIds = new Set(),
}) {
  const show = React.useMemo(() => ({
    title: true,
    space: true,
    owner: true,
    impact: true,
    updated: true,
    status: true,
    actions: true,
    ...(visibleColumns || {}),
  }), [visibleColumns]);

  const headCells = [
    {
      key: 'select',
      content: (
        <Checkbox
          label=""
          isChecked={selected.size === items.length && items.length > 0}
          onChange={(e) => onToggleAll?.(e?.target?.checked)}
        />
      ),
    },
    { key: 'title', content: 'Title' },
    { key: 'space', content: 'Space' },
    { key: 'owner', content: 'Owner' },
    {
      key: 'impact',
      content: (
        <Button appearance="link" onClick={() => {
          const nextDir = sortBy === 'impact' && sortDir === 'desc' ? 'asc' : 'desc';
          onSort?.('impact', nextDir);
        }}>
          Impact {sortBy === 'impact' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
        </Button>
      ),
    },
    {
      key: 'updated',
      content: (
        <Button appearance="link" onClick={() => {
          const nextDir = sortBy === 'updated' && sortDir === 'desc' ? 'asc' : 'desc';
          onSort?.('updated', nextDir);
        }}>
          Last Updated {sortBy === 'updated' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
        </Button>
      ),
    },
    { key: 'status', content: 'Status' },
    { key: 'actions', content: 'Recommended Actions' },
  ];

  const head = {
    cells: headCells.filter((c) => c.key === 'select' || show[c.key]),
  };

  // Build relative page URL (same as ImpactScore.jsx); UI Kit Link handles navigation out of iframe
  const toPageUrl = React.useCallback((it) => {
    const id = encodeURIComponent(String(it?.id ?? ''));
    const key = it?.spaceKey ? encodeURIComponent(String(it.spaceKey)) : '';
    if (key) return `/wiki/spaces/${key}/pages/${id}`;
    return `/wiki/pages/viewpage.action?pageId=${id}`;
  }, []);

  const keepCell = (cell) => {
    const k = String(cell.key || '');
    if (k.startsWith('sel-')) return true;
    if (k.startsWith('title-')) return !!show.title;
    if (k.startsWith('space-')) return !!show.space;
    if (k.startsWith('owner-')) return !!show.owner;
    if (k.startsWith('impact-')) return !!show.impact;
    if (k.startsWith('updated-')) return !!show.updated;
    if (k.startsWith('status-')) return !!show.status;
    if (k.startsWith('actions-')) return !!show.actions;
    return true;
  };

  const rows = (items || []).map((x) => {
    const ownerEntry = owners?.[String(x.id)];
    const cells = [
      {
        key: `sel-${x.id}`,
        content: (
          <Checkbox
            label=""
            isChecked={selected.has(x.id)}
            onChange={(e) => onToggleOne?.(x.id, e?.target?.checked)}
          />
        ),
      },
      { key: `title-${x.id}`, content: (
          <Link href={toPageUrl(x)} openNewTab>{x.title}</Link>
      ) },
      { key: `space-${x.id}`, content: (
          <Link href={`/wiki/spaces/${x.spaceKey}/overview`} openNewTab>{x.spaceKey}</Link>
      ) },
      { key: `owner-${x.id}`, content: (() => {
        if (typeof ownerEntry === 'undefined' && ownerLoadingIds?.has?.(String(x.id))) {
          return <Text>Loading...</Text>;
        }
        const displayName = ownerEntry?.displayName || ownerEntry || '—';
        if (ownerEntry?.profileUrl) {
          return <Link href={ownerEntry.profileUrl} openNewTab>{displayName}</Link>;
        }
        return <Text>{displayName}</Text>;
      })() },
      { key: `impact-${x.id}`, content: <ImpactBadge score={x.impactScore} /> },
      { key: `updated-${x.id}`, content: <Text>{new Date(x.lastUpdated).toLocaleDateString()}</Text> },
      { key: `status-${x.id}`, content: <StatusBadge status={x.status} /> },
      {
        key: `actions-${x.id}`,
        content: (
          <Inline space="space.100">
            <Button
              appearance="link"
              isDisabled={rowLoadingIds.has?.(x.id)}
              onClick={() => onRowAction?.(x.id, 'archive')}
            >
              Archive
            </Button>
            <Button
              appearance="link"
              isDisabled={rowLoadingIds.has?.(x.id)}
              onClick={() => onRowAction?.(x.id, 'whitelist')}
            >
              Whitelist
            </Button>
            <Button
              appearance="link"
              isDisabled={rowLoadingIds.has?.(x.id)}
              onClick={() => onRowAction?.(x.id, 'tag')}
            >
              Tag
            </Button>
          </Inline>
        ),
      },
    ];
    return {
      key: String(x.id),
      cells: cells.filter(keepCell),
    };
  });

  return (
    <DynamicTable
      caption="Detected pages"
      head={head}
      rows={rows}
      isLoading={loading}
    />
  );
}

DetectedTable.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    spaceKey: PropTypes.string,
    impactScore: PropTypes.number,
    lastUpdated: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    status: PropTypes.string,
    flags: PropTypes.object,
  })),
  loading: PropTypes.bool,
  selected: PropTypes.instanceOf(Set).isRequired,
  onToggleAll: PropTypes.func,
  onToggleOne: PropTypes.func,
  sortBy: PropTypes.oneOf(['impact', 'updated']).isRequired,
  sortDir: PropTypes.oneOf(['asc', 'desc']).isRequired,
  onSort: PropTypes.func,
  owners: PropTypes.object,
  onRowAction: PropTypes.func,
  rowLoadingIds: PropTypes.instanceOf(Set),
  visibleColumns: PropTypes.shape({
    title: PropTypes.bool,
    space: PropTypes.bool,
    owner: PropTypes.bool,
    impact: PropTypes.bool,
    updated: PropTypes.bool,
    status: PropTypes.bool,
    actions: PropTypes.bool,
  }),
  ownerLoadingIds: PropTypes.instanceOf(Set),
};
