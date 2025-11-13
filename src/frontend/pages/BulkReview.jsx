import React from 'react';
import { Text, Box, Inline, Stack, Button, SectionMessage, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition, Heading, Textfield } from '@forge/react';
import { invoke } from '@forge/bridge';
import { friendlyError } from '../utils/friendlyError';
import PageHeader from '../components/common/PageHeader';

const BulkReview = () => {
  const [items, setItems] = React.useState([]);
  const [index, setIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [confirm, setConfirm] = React.useState(null); // { action, id, title, reason? }

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoke('listDetectedPages', { page: 1, pageSize: 200, status: 'any' });
      if (res?.ok) setItems(res.results || res.items || []);
      else setItems([]);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
      setIndex(0);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const current = items[index];

  const doAction = (action) => {
    if (!current) return;
    setConfirm({ action, id: current.id, title: current.title });
  };

  const apply = async () => {
    if (!confirm) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await invoke('applyBulkAction', { pageIds: [confirm.id], action: confirm.action, reason: confirm.reason || 'bulk-review' });
      if (res?.ok) {
        const errCount = Array.isArray(res.errors) ? res.errors.length : 0;
        setMessage({ appearance: errCount ? 'warning' : 'success', text: errCount ? `${confirm.action} applied with ${errCount} warning(s)` : `${confirm.action} applied` });
        setConfirm(null);
        // move next
        setIndex((i) => Math.min(items.length - 1, i + 1));
        await load();
      } else {
        setMessage({ appearance: 'error', text: res?.error || 'Action failed' });
      }
    } catch (e) {
      setMessage({ appearance: 'error', text: friendlyError(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Bulk Review" actions={<Button onClick={load} isLoading={loading}>Reload</Button>} />
      {message && (
        <Box padding="space.200">
          <SectionMessage appearance={message.appearance}>{message.text}</SectionMessage>
        </Box>
      )}
      {!current ? (
        <Text>{loading ? 'Loading…' : 'No items to review.'}</Text>
      ) : (
        <Box paddingTop="space.300">
          <Stack space="space.200">
            <Text>Item {index + 1} / {items.length}</Text>
            <Heading level="h500">{current.title}</Heading>
            <Text>Space: {current.spaceKey} • Impact: {current.impactScore} • Updated: {new Date(current.lastUpdated).toLocaleString()}</Text>
            <Inline space="space.200">
              <Button appearance="primary" onClick={() => doAction('tag')}>Keep (Tag)</Button>
              <Button onClick={() => doAction('whitelist')}>Add to Whitelist</Button>
              <Button appearance="warning" onClick={() => doAction('archive')}>Archive</Button>
              <Button onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}>Skip</Button>
              <Button onClick={() => setIndex((i) => Math.max(0, i - 1))}>Back</Button>
            </Inline>
          </Stack>
        </Box>
      )}

      <ModalTransition>
        {confirm && (
          <Modal onClose={() => setConfirm(null)}>
            <ModalHeader>
              <ModalTitle>Confirm Action</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Stack space="space.200">
                <Text>Action: {confirm.action}</Text>
                <Text>Page: {confirm.title}</Text>
                <Textfield
                  name="reason"
                  label="Reason (optional)"
                  value={confirm.reason || ''}
                  onChange={(e) => setConfirm((c) => ({ ...c, reason: e?.target?.value || '' }))}
                />
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Inline space="space.200">
                <Button appearance="primary" onClick={apply} isLoading={loading}>Confirm</Button>
                <Button onClick={() => setConfirm(null)}>Cancel</Button>
              </Inline>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </Box>
  );
};

export default BulkReview;
