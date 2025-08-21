import React from 'react';
import { Box, Inline, Stack, Text, Heading, Button, Textfield, SectionMessage, Spinner, BarChart, Link } from '@forge/react';
import { invoke } from '@forge/bridge';
import { friendlyError } from '../utils/friendlyError';
import Pagination from '../components/Pagination';
import { useDetectedPages } from '../hooks/useDetectedPages';
import PageHeader from '../components/common/PageHeader';

const SCORE_BUCKETS = [
  { label: '0-19', min: 0, max: 19, type: 'low' },
  { label: '20-39', min: 20, max: 39, type: 'low' },
  { label: '40-59', min: 40, max: 59, type: 'medium' },
  { label: '60-79', min: 60, max: 79, type: 'high' },
  { label: '80-100', min: 80, max: 100, type: 'high' },
];

export default function ImpactScore() {
  // Reuse existing fetching/pagination/sorting pattern
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
    loading,
    error,
  } = useDetectedPages();

  // Additional UI state
  const [range, setRange] = React.useState('all'); // all|high|medium|low
  const [spaceKey, setSpaceKey] = React.useState('');

  // Chart data state (we fetch a larger sample for the distribution)
  const [chartData, setChartData] = React.useState([]);
  const [chartLoading, setChartLoading] = React.useState(false);
  const [chartError, setChartError] = React.useState(null);

  // Ensure default status/flags for this page (include all statuses by default)
  React.useEffect(() => {
    if (status !== 'any') setStatus('any');
    if (flags?.stale || flags?.inactive || flags?.orphaned || flags?.incomplete) setFlags({ stale: false, inactive: false, orphaned: false, incomplete: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch distribution for bar chart when filters change
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setChartLoading(true);
      setChartError(null);
      try {
        const res = await invoke('listDetectedPages', {
          search,
          minImpact: Number(minImpact) || 0,
          // no status -> include all statuses
          flags: { stale: false, inactive: false, orphaned: false, incomplete: false },
          page: 1,
          pageSize: 1000,
          sortBy: 'impact',
          sortDir: 'desc',
        });
        if (!res?.ok) throw new Error(res?.error || 'Failed to load');
        let all = res.results || res.items || [];
        // Apply client-side space filter for chart if provided
        if (spaceKey && spaceKey.trim()) {
          const sk = spaceKey.trim().toLowerCase();
          all = all.filter((it) => String(it.spaceKey || '').toLowerCase() === sk);
        }
        // Build buckets
        const counts = SCORE_BUCKETS.map((b) => ({ ...b, value: 0 }));
        all.forEach((it) => {
          const s = Math.max(0, Math.min(100, Number(it.impactScore) || 0));
          for (const b of counts) {
            if (s >= b.min && s <= b.max) {
              b.value += 1;
              break;
            }
          }
        });
        const data = counts.map(({ label, value }) => [label, value]);
        if (!cancelled) setChartData(data);
      } catch (e) {
        if (!cancelled) setChartError(friendlyError(e));
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search, minImpact, spaceKey]);

  // Client-side range filter for the card list
  const visibleItems = React.useMemo(() => {
    const list = items || [];
    const bySpace = spaceKey && spaceKey.trim()
      ? list.filter((it) => String(it.spaceKey || '').toLowerCase() === spaceKey.trim().toLowerCase())
      : list;
    if (range === 'high') return bySpace.filter((it) => (Number(it.impactScore) || 0) >= 70);
    if (range === 'medium') return bySpace.filter((it) => (Number(it.impactScore) || 0) >= 40 && (Number(it.impactScore) || 0) < 70);
    if (range === 'low') return bySpace.filter((it) => (Number(it.impactScore) || 0) < 40);
    return bySpace;
  }, [items, range, spaceKey]);

  const toPageUrl = React.useCallback((it) => {
    const id = encodeURIComponent(String(it?.id ?? ''));
    const key = it?.spaceKey ? encodeURIComponent(String(it.spaceKey)) : '';
    if (key) return `/wiki/spaces/${key}/pages/${id}`;
    return `/wiki/pages/viewpage.action?pageId=${id}`;
  }, []);

  return (
    <Box padding="space.200">
      <Stack space="space.300">
        <PageHeader title="Impact Score" />

        {(error || chartError) && (
          <SectionMessage title="Info" appearance={error ? 'error' : 'warning'}>
            <Text>{error || chartError}</Text>
          </SectionMessage>
        )}

        {/* Filters */}
        <Inline space="space.300" alignBlock="center" shouldWrap>
          <Textfield
            name="search"
            placeholder="Search title/space"
            value={search}
            onChange={(e) => setSearch?.(e?.target?.value ?? '')}
          />
          <Inline space="space.100">
            <Button appearance={range === 'all' ? 'primary' : 'default'} onClick={() => { setRange('all'); setMinImpact(0); }}>All</Button>
            <Button appearance={range === 'high' ? 'primary' : 'default'} onClick={() => { setRange('high'); setMinImpact(70); }}>High (70+)</Button>
            <Button appearance={range === 'medium' ? 'primary' : 'default'} onClick={() => { setRange('medium'); setMinImpact(40); }}>Medium (40-69)</Button>
            <Button appearance={range === 'low' ? 'primary' : 'default'} onClick={() => { setRange('low'); setMinImpact(0); }}>Low (&lt; 40)</Button>
          </Inline>
          <Textfield
            name="spaceKey"
            placeholder="Space key (exact)"
            value={spaceKey}
            onChange={(e) => setSpaceKey(e?.target?.value ?? '')}
          />
        </Inline>

        {/* Chart */}
        <Box>
          <Heading size="medium">Score Distribution</Heading>
          {chartLoading ? (
            <Box padding="space.400"><Spinner /></Box>
          ) : (
            <BarChart data={chartData} xAccessor={0} yAccessor={1} />
          )}
        </Box>

        {/* Cards */}
        <Stack space="space.200">
          <Heading size="medium">Pages</Heading>
          {loading ? (
            <Box padding="space.400"><Spinner /></Box>
          ) : (
            <Stack space="space.200">
              {visibleItems.map((it) => (
                <Box key={it.id} padding="space.200" testId={`impact-card-${it.id}`} style={{ border: '1px solid #DFE1E6', borderRadius: 4 }}>
                  <Stack space="space.100">
                    <Inline space="space.200" shouldWrap alignBlock="center">
                      <Heading size="small">
                        <Link href={toPageUrl(it)} openNewTab>
                          {it.title}
                        </Link>
                      </Heading>
                      <Text>•</Text>
                      <Text>Space: {it.spaceKey}</Text>
                      <Text>•</Text>
                      <Text>
                        Updated: {it.lastUpdated ? (() => {
                          const d = new Date(it.lastUpdated);
                          return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
                        })() : 'N/A'}
                      </Text>
                      <Text>•</Text>
                      <Text>Status: {it.status}</Text>
                    </Inline>
                    <Inline space="space.200" alignBlock="center">
                      <Text><Text as="strong">Impact:</Text> {it.impactScore}</Text>
                      {/* Simple progress bar representation */}
                      <Box style={{ width: 200, height: 8, backgroundColor: '#F4F5F7', borderRadius: 4, overflow: 'hidden' }}>
                        <Box style={{ width: `${Math.max(0, Math.min(100, Number(it.impactScore) || 0))}%`, height: '100%', backgroundColor: (Number(it.impactScore) || 0) >= 60 ? '#36B37E' : (Number(it.impactScore) || 0) >= 40 ? '#FFAB00' : '#FF5630' }} />
                      </Box>
                    </Inline>
                    <Inline space="space.200" shouldWrap>
                      {/* Contributing metrics not yet available from backend; show flags as proxies */}
                      {it.flags?.stale && <Text>Stale</Text>}
                      {it.flags?.inactive && <Text>Inactive</Text>}
                      {it.flags?.orphaned && <Text>Orphaned</Text>}
                      {it.flags?.incomplete && <Text>Incomplete</Text>}
                    </Inline>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onChange={setPage}
        />
      </Stack>
    </Box>
  );
}
