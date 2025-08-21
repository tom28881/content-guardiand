/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useDashboard } from '../../../src/frontend/hooks/useDashboard';
import { invoke } from '@forge/bridge';

// Mock the invoke function from @forge/bridge
jest.mock('@forge/bridge');

describe('useDashboard Hook', () => {
  beforeEach(() => {
    // Clear all previous mock calls before each test
    invoke.mockClear();
  });

  it('should fetch dashboard data on initial render', async () => {
    const mockData = { ok: true, stats: { total: 10 }, lastScan: '2023-01-01' };
    invoke.mockResolvedValue(mockData);

    const { result, waitForNextUpdate } = renderHook(() => useDashboard());

    // Initial state should be loading
    expect(result.current.loading).toBe(true);

    // Wait for the async operation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(invoke).toHaveBeenCalledWith('getDashboard', {});
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.message).toBeNull();
  });

  it('should handle error when fetching dashboard data', async () => {
    const mockError = { ok: false, error: 'Failed to fetch' };
    invoke.mockResolvedValue(mockError);

    const { result } = renderHook(() => useDashboard());

    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.message).toEqual({ appearance: 'error', text: 'Failed to fetch' });
  });

  it('should handle startScan successfully', async () => {
    const { result } = renderHook(() => useDashboard());

    invoke.mockResolvedValue({ ok: true, created: 5, total: 15 });

    await act(async () => {
      await result.current.startScan();
    });

    expect(invoke).toHaveBeenCalledWith('startScan', { mode: 'real' });
    expect(result.current.message).toEqual({ appearance: 'success', text: 'Scan created 5 items. Total: 15' });
  });

  it('should handle startScan failure', async () => {
    const { result } = renderHook(() => useDashboard());

    invoke.mockResolvedValue({ ok: false, error: 'Scan failed' });

    await act(async () => {
      await result.current.startScan();
    });

    expect(invoke).toHaveBeenCalledWith('startScan', { mode: 'real' });
    expect(result.current.message).toEqual({ appearance: 'error', text: 'Scan failed' });
  });
});
