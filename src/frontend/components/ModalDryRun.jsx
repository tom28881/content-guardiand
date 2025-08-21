import React from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition, Stack, Text, Inline, Button, Textfield } from '@forge/react';

export default function ModalDryRun({ dryRun, onConfirm, onClose }) {
  const [reason, setReason] = React.useState('');
  return (
    <ModalTransition>
      {dryRun && (
        <Modal onClose={onClose}>
          <ModalHeader>
            <ModalTitle>Dry-Run Result</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Stack space="space.200">
              <Text>Action: {dryRun.action}</Text>
              <Text>Selected: {dryRun.counts?.selected || 0}</Text>
              <Text>Warnings: {dryRun.counts?.warnings || 0}</Text>
              <Textfield
                name="reason"
                label="Důvod (volitelné)"
                value={reason}
                onChange={(e) => setReason(e?.target?.value || '')}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Inline space="space.200">
              <Button appearance="primary" onClick={() => onConfirm?.(reason)}>Confirm</Button>
              <Button onClick={onClose}>Cancel</Button>
            </Inline>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
}
