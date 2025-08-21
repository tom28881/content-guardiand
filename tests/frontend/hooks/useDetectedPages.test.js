/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useDetectedPages } from '../../../src/frontend/hooks/useDetectedPages';
import { invoke } from '@forge/bridge';
import { downloadFile } from '../../../src/frontend/utils/download';

// Mock dependencies
jest.mock('@forge/bridge');
jest.mock('../../../src/frontend/utils/download', () => ({
  downloadFile: jest.fn(),
}));

describe('useDetectedPages Hook', () => {
  beforeEach(() => {
    // Reset mocks before each test
    invoke.mockClear();
    downloadFile.mockClear();
  });

  it('should load detected pages on initial render', async () => {
    const mockResponse = {
      ok: true,
      items: [{ id: '1', title: 'Test Page' }],
      total: 1,
    };
    invoke.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useDetectedPages());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(invoke).toHaveBeenCalledWith('listDetectedPages', expect.any(Object));
    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual(mockResponse.items);
    expect(result.current.total).toBe(mockResponse.total);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when loading pages', async () => {
    const mockError = { ok: false, error: 'Failed to fetch data' };
    invoke.mockResolvedValue(mockError);

    const { result } = renderHook(() => useDetectedPages());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.error).toBe('Failed to fetch data');
  });

  it('should toggle all items selection', async () => {
    const mockResponse = {
      ok: true,
      items: [{ id: '1' }, { id: '2' }],
      total: 2,
    };
    invoke.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useDetectedPages());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      result.current.toggleAll(true);
      expect(result.current.selected.size).toBe(2);
    });

    expect(result.current.selected).toEqual(new Set(['1', '2']));

    await waitFor(() => {
      result.current.toggleAll(false);
      expect(result.current.selected.size).toBe(0);
    });

    expect(result.current.selected).toEqual(new Set());
  });

  it('should toggle a single item selection', async () => {
    const { result } = renderHook(() => useDetectedPages());

    // Wait for initial load to finish
    await waitFor(() => expect(result.current.loading).toBe(false));

    await waitFor(() => {
      result.current.toggleOne('1', true);
      expect(result.current.selected).toEqual(new Set(['1']));
    });

    await waitFor(() => {
      result.current.toggleOne('2', true);
      expect(result.current.selected).toEqual(new Set(['1', '2']));
    });

    await waitFor(() => {
      result.current.toggleOne('1', false);
      expect(result.current.selected).toEqual(new Set(['2']));
    });
  });

  it('should re-fetch data when sorting changes', async () => {
    const { result } = renderHook(() => useDetectedPages());

    // Wait for the initial load to finish
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Clear mock calls from initial load
    invoke.mockClear();

    // Change sorting
    await waitFor(() => {
      result.current.onSort('title', 'asc');
    });

    // It should trigger a new fetch with the new sorting parameters
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(invoke).toHaveBeenCalledWith('listDetectedPages', expect.objectContaining({
      sortBy: 'impact', // Note: sortBy is hardcoded to 'impact' or 'updated' in the hook
      sortDir: 'asc',
    }));
  });

  it('should perform a dry run', async () => {
    const { result } = renderHook(() => useDetectedPages());
    const mockDryRunResponse = { ok: true, message: 'Dry run successful' };

    // Setup: select an item and set an action
    await waitFor(() => result.current.toggleOne('1', true));
    await waitFor(() => result.current.setAction('archive'));

    // Mock the API call
    invoke.mockResolvedValue(mockDryRunResponse);

    // Perform the dry run
    await waitFor(() => result.current.doDryRun());

    // Assertions
    expect(invoke).toHaveBeenCalledWith('dryRunAction', {
      pageIds: ['1'],
      action: 'archive',
    });
    expect(result.current.dryRun).toEqual(mockDryRunResponse);
  });

  it('should apply an action and refresh the list', async () => {
    const { result } = renderHook(() => useDetectedPages());

    // Setup: select an item and set an action
    await waitFor(() => result.current.toggleOne('1', true));
    await waitFor(() => result.current.setAction('archive'));

    // Mock the applyBulkAction call and the subsequent load call
    invoke
      .mockResolvedValueOnce({ ok: true }) // For applyBulkAction
      .mockResolvedValueOnce({ ok: true, items: [], total: 0 }); // For the refresh (load)

    // Perform the action
    await waitFor(() => result.current.applyAction('Test reason'));

    // Assertions
    expect(invoke).toHaveBeenCalledWith('applyBulkAction', {
      pageIds: ['1'],
      action: 'archive',
      reason: 'Test reason',
    });

    // Check that state was reset
    expect(result.current.selected.size).toBe(0);
    expect(result.current.dryRun).toBeNull();

    // Check that the list was refreshed
    expect(invoke).toHaveBeenCalledWith('listDetectedPages', expect.any(Object));
  });

  it('should handle exporting data', async () => {
    const { result } = renderHook(() => useDetectedPages());
    const mockExportResponse = { ok: true, csv: 'col1,col2\nval1,val2', excelHtml: '<table>...</table>' };

    // Mock the export API call
    invoke.mockResolvedValue(mockExportResponse);

    // Trigger the export
    await waitFor(() => result.current.openExport('csv'));

    // Assertions
    expect(invoke).toHaveBeenCalledWith('exportDetectedPages', expect.any(Object));
    expect(result.current.exportData).toEqual(mockExportResponse);
  });

  it('should download a file from modal data', async () => {
    const { result } = renderHook(() => useDetectedPages());
    const mockExportData = { ok: true, csv: 'a,b', excelHtml: '<table>' };

    // Manually set the export data as if openExport was already called
    await waitFor(() => result.current.setExportData(mockExportData));

    // Download CSV
    await waitFor(() => result.current.downloadFromModal('csv'));
    expect(downloadFile).toHaveBeenCalledWith(expect.objectContaining({ content: 'a,b', ext: 'csv' }));

    // Download XLS
    await waitFor(() => result.current.downloadFromModal('xls'));
    expect(downloadFile).toHaveBeenCalledWith(expect.objectContaining({ content: '<table>', ext: 'xls' }));
  });
});
