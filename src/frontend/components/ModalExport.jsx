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
  Button,
  TextArea,
  Inline
} from '@forge/react';

const ModalExport = ({ exportData, onClose, onDownload, exporting }) => {
  if (!exportData) {
    return null;
  }

  return (
    <ModalTransition>
      <Modal onClose={onClose}>
        <ModalHeader>
          <ModalTitle>Export Detected Pages</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Stack space="space.200">
            <Text>Your export is ready. You can download it in CSV or Excel (HTML) format.</Text>
            <Text as="strong">CSV Preview:</Text>
            <TextArea
              isReadOnly
              resize="vertical"
              value={exportData.csv.substring(0, 500) + (exportData.csv.length > 500 ? '...' : '')}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Inline space="space.200" align="end">
            <Button appearance="primary" onClick={() => onDownload('csv')} isLoading={exporting}>Download CSV</Button>
            <Button onClick={() => onDownload('excel')} isLoading={exporting}>Download Excel</Button>
            <Button onClick={onClose}>Close</Button>
          </Inline>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
};

export default ModalExport;
