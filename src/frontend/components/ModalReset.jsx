import React from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
  Stack,
  Text,
  Inline,
  Button,
  Textfield,
  SectionMessage,
} from '@forge/react';

export default function ModalReset({ open, onConfirm, onClose, loading, error }) {
  const [confirmText, setConfirmText] = React.useState('');
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setConfirmText('');
      setReason('');
    }
  }, [open]);

  const canConfirm = String(confirmText).trim().toUpperCase() === 'RESET' && !loading;

  return (
    <ModalTransition>
      {open && (
        <Modal onClose={onClose}>
          <ModalHeader>
            <ModalTitle>Reset Detected Pages</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Stack space="space.200">
              <Text>
                This will remove all stored detected pages (across all statuses) from the index. It does not touch the audit log.
              </Text>
              <Text>Type RESET to confirm this destructive action.</Text>
              <Textfield
                name="confirm"
                label="Type RESET to confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e?.target?.value || '')}
              />
              <Textfield
                name="reason"
                label="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e?.target?.value || '')}
              />
              {error && (
                <SectionMessage title="Error" appearance="error">
                  <Text>{String(error)}</Text>
                </SectionMessage>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Inline space="space.200">
              <Button appearance="warning" isDisabled={!canConfirm} isLoading={!!loading} onClick={() => onConfirm?.(reason)}>
                Confirm Reset
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </Inline>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
}
