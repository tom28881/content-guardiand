import React from 'react';
import { Text, Box, Inline, Stack, Button, SectionMessage, DonutChart, PieChart, BarChart, Heading, Tooltip } from '@forge/react';
import PageHeader from '../components/common/PageHeader';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = ({ onNavigateToDetected }) => {
  const { data, loading, message, startScan, refresh, debugScan } = useDashboard();

  const isLoading = loading && !data;
  // Prepare chart datasets in formats expected by UI Kit charts
  const statusData = (data?.statusBreakdownAA || []).map(([label, value]) => ({
    type: String(label).toLowerCase(),
    label,
    value,
  }));
  const flagsData = (data?.flagsBreakdownAA || []).map(([label, value]) => ({
    type: String(label).toLowerCase(),
    label,
    value,
  }));
  const weeklyData = data?.weeklyTrendAA || [];
  const weeklyAvgData = data?.weeklyAvgImpactAA || [];
  const problemSpaces = data?.problemSpacesAA || [];

  const navDetected = (filters) => {
    if (typeof onNavigateToDetected === 'function') onNavigateToDetected(filters);
  };
  const mapStatusLabelToKey = (lbl) => String(lbl || '').toLowerCase();
  const mapFlagLabelToKey = (lbl) => String(lbl || '').toLowerCase();

  return (
    <Box padding="space.200">
      <PageHeader
        title="Dashboard"
        actions={(
          <Inline space="space.300" alignBlock="center">
            <Button appearance="primary" onClick={startScan} isDisabled={loading}>
              Run Scan
            </Button>
            <Button appearance="warning" onClick={debugScan} isDisabled={loading}>
              🔍 Debug Scan
            </Button>
            <Button onClick={refresh} isDisabled={loading}>Refresh</Button>
            {loading && <Text>Loading...</Text>}
          </Inline>
        )}
      />

      {message && (
        <Box paddingBlock="space.200">
          <SectionMessage title={message.appearance === 'error' ? 'Error' : 'Info'} appearance={message.appearance}>
            <Text>{message.text}</Text>
          </SectionMessage>
        </Box>
      )}

      {isLoading ? (
        <Box padding="space.400">
          <Text>Loading dashboard...</Text>
        </Box>
      ) : data ? (
        <Stack space="space.300" grow="unbounded">
          {/* KPI cards */}
          <Inline space="space.300" shouldWrap>
            <Box padding="space.150" backgroundColor="color.background.neutral.subtle" xcss={{ borderRadius: '3px', minWidth: '220px', border: '2px solid #DE350B' }}>
              <Text as="strong">Problem pages</Text>
              <Heading as="h3" size="xlarge">{data.problemPagesCount ?? data.total}</Heading>
              <Inline space="space.100">
                <Tooltip text="Open detected (and tagged) pages">
                  <Button appearance="link" onClick={() => navDetected({ status: 'detected' })}>View detected</Button>
                </Tooltip>
                <Tooltip text="High impact pages (≥ 70)">
                  <Button appearance="link" onClick={() => navDetected({ minImpact: 70 })}>High impact</Button>
                </Tooltip>
              </Inline>
            </Box>
            <Box padding="space.150" backgroundColor="color.background.neutral.subtle" xcss={{ borderRadius: '3px', minWidth: '220px' }}>
              <Text as="strong">Total pages</Text>
              <Heading as="h3" size="xlarge">{typeof data.totalPages === 'number' ? data.totalPages : 'N/A'}</Heading>
              <Text size="small">Site-wide</Text>
            </Box>
            <Box padding="space.150" backgroundColor="color.background.neutral.subtle" xcss={{ borderRadius: '3px', minWidth: '220px' }}>
              <Text as="strong">Active users (30d)</Text>
              <Heading as="h3" size="xlarge">{data.activeUsersOk && typeof data.activeUsers30d === 'number' ? data.activeUsers30d : 'N/A'}</Heading>
              <Text size="small">Editors in last 30 days</Text>
            </Box>
            <Box padding="space.150" backgroundColor="color.background.neutral.subtle" xcss={{ borderRadius: '3px', minWidth: '220px' }}>
              <Text as="strong">Avg impact</Text>
              <Heading as="h3" size="xlarge">{data.avgImpact}</Heading>
              <Text size="small">Last scan: {data.lastScan ? new Date(data.lastScan).toLocaleString() : 'N/A'}</Text>
            </Box>
          </Inline>

          {/* Quick access links */}
          <Inline space="space.150" shouldWrap>
            <Tooltip text="Show all detected pages">
              <Button appearance="subtle" onClick={() => navDetected({ status: 'detected' })}>Detected</Button>
            </Tooltip>
            <Tooltip text="Stale pages">
              <Button appearance="subtle" onClick={() => navDetected({ flags: ['stale'] })}>Stale</Button>
            </Tooltip>
            <Tooltip text="Orphaned pages">
              <Button appearance="subtle" onClick={() => navDetected({ flags: ['orphaned'] })}>Orphaned</Button>
            </Tooltip>
            <Tooltip text="Inactive pages">
              <Button appearance="subtle" onClick={() => navDetected({ flags: ['inactive'] })}>Inactive</Button>
            </Tooltip>
            <Tooltip text="Incomplete pages">
              <Button appearance="subtle" onClick={() => navDetected({ flags: ['incomplete'] })}>Incomplete</Button>
            </Tooltip>
            <Tooltip text="Impact ≥ 50">
              <Button appearance="subtle" onClick={() => navDetected({ minImpact: 50 })}>Impact ≥ 50</Button>
            </Tooltip>
          </Inline>

          <Inline shouldWrap={true} space="space.300" alignBlock="start">
            <Box>
              <Heading size="medium">Status Breakdown</Heading>
              <DonutChart
                data={statusData}
                width={360}
                labelAccessor="label"
                valueAccessor="value"
                colorAccessor="type"
              />
              <Inline space="space.100" shouldWrap>
                {(data?.statusBreakdownAA || []).map(([label, value]) => (
                  <Tooltip key={label} text={`Open pages where status = ${label}`}>
                    <Button appearance="link" onClick={() => navDetected({ status: mapStatusLabelToKey(label) })}>
                      {label} ({value})
                    </Button>
                  </Tooltip>
                ))}
              </Inline>
            </Box>
            <Box>
              <Heading size="medium">Flags Breakdown</Heading>
              <PieChart
                data={flagsData}
                width={360}
                labelAccessor="label"
                valueAccessor="value"
                colorAccessor="type"
              />
              <Inline space="space.100" shouldWrap>
                {(data?.flagsBreakdownAA || []).map(([label, value]) => (
                  <Tooltip key={label} text={`Open pages with flag: ${label}`}>
                    <Button appearance="link" onClick={() => navDetected({ flags: [mapFlagLabelToKey(label)] })}>
                      {label} ({value})
                    </Button>
                  </Tooltip>
                ))}
              </Inline>
            </Box>
          </Inline>

          <Box>
            <Heading size="medium">Weekly Trend</Heading>
            <BarChart data={weeklyData} xAccessor={0} yAccessor={1} />
          </Box>

          <Box>
            <Heading size="medium">Weekly Avg Impact</Heading>
            <BarChart data={weeklyAvgData} xAccessor={0} yAccessor={1} />
          </Box>

          <Box>
            <Heading size="medium">Problem Spaces</Heading>
            {problemSpaces.length === 0 ? (
              <Text>No problem spaces yet.</Text>
            ) : (
              <Inline space="space.150" shouldWrap>
                {problemSpaces.map(([spaceKey, count, avgImp, topFlag]) => (
                  <Tooltip key={spaceKey} text={`Count: ${count}, Avg impact: ${avgImp}${topFlag ? `, Top flag: ${topFlag}` : ''}`}>
                    <Button
                      appearance="subtle"
                      onClick={() => navDetected({ search: spaceKey, ...(topFlag ? { flags: [String(topFlag)] } : {}) })}
                    >
                      <Inline space="space.100" alignBlock="center">
                        <Box xcss={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: (topFlag === 'orphaned' ? '#DE350B' : topFlag === 'stale' ? '#FF8B00' : topFlag === 'incomplete' ? '#6554C0' : topFlag === 'inactive' ? '#E2B203' : (avgImp >= 70 ? '#DE350B' : avgImp >= 40 ? '#FF8B00' : '#36B37E')) }} />
                        <Text>{spaceKey} ({count})</Text>
                      </Inline>
                    </Button>
                  </Tooltip>
                ))}
              </Inline>
            )}
          </Box>
        </Stack>
      ) : (
        <Box padding="space.400">
          <Text>No data available. Run a scan to get started.</Text>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
