import React from 'react';
import { Inline, Button } from '@forge/react';

export default function ActionBar({
  action,
  setAction,
  selectedCount,
  onDryRun,
  onExportCsv,
  onExportExcel,
  onExportSelectedCsv,
  onExportSelectedExcel,
  exporting,
  onReset,
}) {
  return (
    <Inline space="space.300">
      <Button appearance={action === 'archive' ? 'primary' : 'default'} onClick={() => setAction?.('archive')}>Archive</Button>
      <Button appearance={action === 'whitelist' ? 'primary' : 'default'} onClick={() => setAction?.('whitelist')}>Whitelist</Button>
      <Button appearance={action === 'tag' ? 'primary' : 'default'} onClick={() => setAction?.('tag')}>Tag</Button>
      <Button isDisabled={!selectedCount || !action} appearance="warning" onClick={onDryRun}>Dry-Run</Button>
      <Button onClick={onExportCsv} isLoading={exporting === 'csv'} isDisabled={!!exporting}>Export CSV</Button>
      <Button onClick={onExportExcel} isLoading={exporting === 'excel'} isDisabled={!!exporting}>Export Excel</Button>
      <Button onClick={onExportSelectedCsv} isDisabled={!selectedCount || !!exporting}>Export Selected CSV</Button>
      <Button onClick={onExportSelectedExcel} isDisabled={!selectedCount || !!exporting}>Export Selected Excel</Button>
      <Button appearance="warning" onClick={onReset}>Reset Detected</Button>
    </Inline>
  );
}
