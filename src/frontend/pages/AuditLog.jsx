import React from 'react';
import { Text, Box, Inline, Button, DynamicTable, Stack, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition, TextArea, SectionMessage } from '@forge/react';
import { invoke } from '@forge/bridge';
import { downloadFile } from '../utils/download';
import { friendlyError } from '../utils/friendlyError';
import PageHeader from '../components/common/PageHeader';
import Pagination from '../components/Pagination';

const AuditLog = () => {
  const [items, setItems] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [loading, setLoading] = React.useState(false);
  const [exportData, setExportData] = React.useState(null);
  const [message, setMessage] = React.useState(null);
  const [exporting, setExporting] = React.useState(false);

  // Trigger CSV download using shared util
  const downloadCsv = React.useCallback(async (csvText) => {
    await downloadFile({
      content: csvText,
      mime: 'text/csv;charset=utf-8;',
      ext: 'csv',
      baseName: 'content-guardian-audit-log',
      setMessage,
    });
  }, [setMessage]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoke('listAuditLog', { page, pageSize });
      if (res?.ok) {
        setItems(res.items || []);
        setTotal(res.total || 0);
      } else {
        setItems([]);
        setTotal(0);
        setMessage({ appearance: 'error', text: friendlyError(res?.error || 'Failed to load audit log') });
      }
    } catch (e) {
      setItems([]);
      setTotal(0);
      setMessage({ appearance: 'error', text: friendlyError(e) });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  React.useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const head = {
    cells: [
      { key: 'time', content: 'Time' },
      { key: 'action', content: 'Action' },
      { key: 'page', content: 'Page' },
      { key: 'space', content: 'Space' },
      { key: 'reason', content: 'Reason' },
    ],
  };
  const rows = (items || []).map((x) => ({
    key: String(x.id),
    cells: [
      { key: `ts-${x.id}`, content: <Text>{new Date(x.ts).toLocaleString()}</Text> },
      { key: `ac-${x.id}`, content: <Text>{x.action}</Text> },
      { key: `pg-${x.id}`, content: <Text>{x.title} ({x.pageId})</Text> },
      { key: `sp-${x.id}`, content: <Text>{x.spaceKey}</Text> },
      { key: `rs-${x.id}`, content: <Text>{x.reason || '—'}</Text> },
    ],
  }));

  return (
    <Box>
      <PageHeader
        title="Audit Log"
        actions={(
          <Inline space="space.300" alignBlock="center">
            <Button onClick={() => load()} isLoading={loading}>Refresh</Button>
            <Button appearance="primary" isLoading={exporting} isDisabled={exporting} onClick={async () => {
          setMessage(null);
          setExporting(true);
          try {
            const res = await invoke('exportAuditLog', {});
            if (res?.ok) setExportData(res);
            else setMessage({ appearance: 'error', text: friendlyError(res?.error || 'Export failed') });
          } catch (e) {
            setMessage({ appearance: 'error', text: friendlyError(e) });
          } finally {
            setExporting(false);
          }
        }}>Export CSV</Button>
          </Inline>
        )}
      />
      {message && (
        <Box padding="space.200">
          <SectionMessage appearance={message.appearance}>{message.text}</SectionMessage>
        </Box>
      )}
      <Box paddingTop="space.300">
        <DynamicTable
          caption="Audit log entries"
          head={head}
          rows={rows}
          isLoading={loading}
        />
        <Inline space="space.200" paddingTop="space.200" alignBlock="center">
          <Pagination page={page} total={total} pageSize={pageSize} onChange={setPage} />
        </Inline>
      </Box>

      <ModalTransition>
        {exportData && (
          <Modal onClose={() => setExportData(null)}>
            <ModalHeader>
              <ModalTitle>Export Audit Log (CSV)</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Stack space="space.200">
                <Text>Total entries: {exportData.total}</Text>
                <TextArea
                  name="csv"
                  value={exportData.csv}
                  isReadOnly
                  resize="vertical"
                />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Inline space="space.200">
                <Button appearance="primary" onClick={() => downloadCsv(exportData.csv)}>Download CSV</Button>
                <Button onClick={() => setExportData(null)}>Close</Button>
              </Inline>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </Box>
  );
};

export default AuditLog;
