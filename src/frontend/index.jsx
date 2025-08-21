import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Heading, Text, Tabs, TabList, Tab, TabPanel, Box, Stack } from '@forge/react';
import { invoke } from '@forge/bridge';
import Dashboard from './pages/Dashboard';
import ImpactScore from './pages/ImpactScore';
import DetectedPages from './pages/DetectedPages';
import BulkReview from './pages/BulkReview';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';
import { friendlyError } from './utils/friendlyError';

const App = () => {
  const [status, setStatus] = useState(null);
  const [tab, setTab] = useState(0); // 0=Dashboard,1=Impact,2=Detected,3=Bulk,4=Audit,5=Settings
  const [detectedInitialFilters, setDetectedInitialFilters] = useState(null);

  const navigateToDetected = React.useCallback((filters) => {
    setDetectedInitialFilters(filters || {});
    setTab(2);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await invoke('ping', {});
        setStatus(res);
      } catch (e) {
        setStatus({ ok: false, error: friendlyError(e) });
      }
    })();
  }, []);

  return (
    <Box padding="space.400">
      <Stack space="space.200">
        <Heading level="h500">Content Guardian</Heading>
        <Text>
          Backend status: {status ? (status.ok ? 'OK' : `Error: ${friendlyError(status.error)}`) : 'Checking...'}
        </Text>
        <Tabs id="main-tabs" testId="main-tabs" selected={tab} onChange={setTab}>
          <TabList>
            <Tab>Dashboard</Tab>
            <Tab>Impact Score</Tab>
            <Tab>Detected Pages</Tab>
            <Tab>Bulk Review</Tab>
            <Tab>Audit Log</Tab>
            <Tab>Settings</Tab>
          </TabList>
          <TabPanel>
            <Dashboard onNavigateToDetected={navigateToDetected} />
          </TabPanel>
          <TabPanel>
            <ImpactScore />
          </TabPanel>
          <TabPanel>
            <DetectedPages initialFilters={detectedInitialFilters} onInitialFiltersConsumed={() => setDetectedInitialFilters(null)} />
          </TabPanel>
          <TabPanel>
            <BulkReview />
          </TabPanel>
          <TabPanel>
            <AuditLog />
          </TabPanel>
          <TabPanel>
            <Settings />
          </TabPanel>
        </Tabs>
      </Stack>
    </Box>
  );
};

ForgeReconciler.render(<App />);
