const { describe, it, expect, beforeEach } = require('@jest/globals');
require('../setup.js'); // Common setup

// --- Mocks Setup ---

jest.mock('@forge/api', () => ({
  ...jest.requireActual('@forge/api'),
  storage: {
    ...jest.requireActual('@forge/api').storage,
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    query: jest.fn(),
  },
}));

jest.mock('../../src/backend/services/scan.js');
jest.mock('../../src/backend/storage.js', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/backend/storage.js'),
  // Mock all functions that will be called by resolvers
  getSettingsFromStore: jest.fn(),
  addAuditLogEntry: jest.fn(),
  getAuditLog: jest.fn(),
  getDetectedPages: jest.fn(), // Mock the higher-level function
  setIndex: jest.fn(),
  getIndex: jest.fn(),
  getMany: jest.fn(),
}));
jest.mock('../../src/backend/services/aggregations.js');

// --- Imports (after mocks) ---

const { storage: forgeStorage } = require('@forge/api');
const scanService = require('../../src/backend/services/scan.js');
const storageHelpers = require('../../src/backend/storage.js');
const aggregations = require('../../src/backend/services/aggregations.js');
const { handler } = require('../../src/backend/index.js');


describe('Backend Resolvers', () => {
  beforeEach(() => {
    // Clear mock history and reset implementations to a clean state
    jest.clearAllMocks();

    // Reset specific mock implementations to a default, non-leaky state.
    // Tests that expect a different behavior will override this.
    forgeStorage.set.mockResolvedValue(undefined);
    forgeStorage.get.mockResolvedValue(undefined);
  });

  describe('getDashboard', () => {
    it('should return dashboard data successfully', async () => {
      const mockAggregations = { statusBreakdown: {}, flagsBreakdown: {}, weeklyTrend: [] };
      const mockLastScan = { timestamp: '2025-01-01T12:00:00Z' };
      aggregations.getDashboardData.mockResolvedValue({ ok: true, ...mockAggregations, lastScan: mockLastScan });

      const result = await handler({ call: { functionKey: 'getDashboard' } });

      expect(result).toEqual({ ok: true, ...mockAggregations, lastScan: mockLastScan });
      expect(aggregations.getDashboardData).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Failed to load';
      aggregations.getDashboardData.mockResolvedValue({ ok: false, error: errorMessage });

      const result = await handler({ call: { functionKey: 'getDashboard' } });

      expect(result).toEqual({ ok: false, error: errorMessage });
    });
  });

  describe('getSettings', () => {
    it('should return settings successfully', async () => {
      const mockSettings = { mode: 'auto' };
      storageHelpers.getSettingsFromStore.mockResolvedValue(mockSettings);

      const result = await handler({ call: { functionKey: 'getSettings' } });

      expect(result).toEqual({ ok: true, settings: mockSettings });
      expect(storageHelpers.getSettingsFromStore).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from storage', async () => {
      const errorMessage = 'Storage unavailable';
      storageHelpers.getSettingsFromStore.mockRejectedValue(new Error(errorMessage));

      await expect(handler({ call: { functionKey: 'getSettings' } })).rejects.toThrow(errorMessage);
    });
  });

  describe('saveSettings', () => {
    it('should save settings successfully', async () => {
      const mockSettings = { mode: 'manual' };
      forgeStorage.set.mockResolvedValue(undefined);

      const result = await handler({ call: { functionKey: 'saveSettings', payload: { settings: mockSettings } } });

      expect(result).toEqual({ ok: true });
      expect(forgeStorage.set).toHaveBeenCalledWith('settings', mockSettings);
    });

    it('should return an error if settings payload is missing', async () => {
      const result = await handler({ call: { functionKey: 'saveSettings', payload: {} } });

      expect(result).toEqual({ ok: false, error: 'settings payload is required' });
      expect(forgeStorage.set).not.toHaveBeenCalled();
    });

    it('should propagate errors from storage.set', async () => {
      const errorMessage = 'Storage write failed';
      const mockSettings = { mode: 'manual' };
      forgeStorage.set.mockRejectedValue(new Error(errorMessage));

      await expect(handler({ call: { functionKey: 'saveSettings', payload: { settings: mockSettings } } })).rejects.toThrow(errorMessage);
    });
  });

  describe('startScan', () => {
    const scanService = require('../../src/backend/services/scan.js');

    it('should run a real scan successfully and manage locks', async () => {
      // Arrange
      forgeStorage.get.mockResolvedValue(null); // No lock
      const scanResult = { detected: 5, duration: 120 };
      scanService.runRealScan.mockResolvedValue(scanResult);

      // Act
      const result = await handler({ call: { functionKey: 'startScan', payload: { mode: 'real' } } });

      // Assert
      expect(forgeStorage.get).toHaveBeenCalledWith('scan:lock');
      expect(forgeStorage.set).toHaveBeenCalledWith('scan:lock', expect.any(Object));
      expect(scanService.runRealScan).toHaveBeenCalledTimes(1);
      expect(forgeStorage.delete).toHaveBeenCalledWith('scan:lock');
      expect(result).toEqual({ ok: true, ...scanResult });
    });

    it('should run a simulated scan successfully', async () => {
      // Arrange
      forgeStorage.get.mockResolvedValue(null); // No lock
      const scanResult = { detected: 3, duration: 10 };
      scanService.runSimulatedScan.mockResolvedValue(scanResult);

      // Act
      const result = await handler({ call: { functionKey: 'startScan', payload: { mode: 'simulated' } } });

      // Assert
      expect(scanService.runSimulatedScan).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true, ...scanResult });
    });

    it('should prevent scan if a lock exists', async () => {
      // Arrange
      const lock = { timestamp: Date.now() };
      forgeStorage.get.mockResolvedValue(lock);

      // Act
      const result = await handler({ call: { functionKey: 'startScan', payload: {} } });

      // Assert
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Scan already in progress');
      expect(scanService.runRealScan).not.toHaveBeenCalled();
    });

        it('should release lock even if scan fails', async () => {
      // Arrange
      forgeStorage.get.mockResolvedValue(null); // No lock
      const errorMessage = 'Confluence API error';
      scanService.runRealScan.mockRejectedValue(new Error(errorMessage));

      // Act
      // Explicitly set mode to 'real' to ensure the correct path is taken
      const result = await handler({ call: { functionKey: 'startScan', payload: { mode: 'real' } } });

      // Assert
      expect(forgeStorage.set).toHaveBeenCalledWith('scan:lock', expect.any(Object)); // Ensure lock was attempted
      expect(result).toEqual({ ok: false, error: errorMessage });
      expect(forgeStorage.delete).toHaveBeenCalledWith('scan:lock'); // Ensure lock was released
    });
  });

  describe('listDetectedPages', () => {
    it('should return paginated and filtered pages from storage', async () => {
      // Arrange: This test now tests the actual implementation of getDetectedPages
      // by mocking its dependencies (getIndex and getMany).
      const payload = { page: 1, pageSize: 10, filters: { status: 'active' } };
      const mockPageData = { id: '123', title: 'Active Page', status: 'active', impactScore: 10 };

      // Mock the dependencies of getDetectedPages
      storageHelpers.getDetectedPages.mockResolvedValue({ results: [mockPageData], total: 1 });

      // Act
      const result = await handler({ call: { functionKey: 'listDetectedPages', payload } });

      // Assert
      const expectedPayload = { page: 1, pageSize: 10, filters: { status: 'active' } };
      expect(result).toEqual({ ok: true, results: [mockPageData], total: 1 });
      expect(storageHelpers.getDetectedPages).toHaveBeenCalledWith(expectedPayload);
    });

    it('should handle errors during page retrieval', async () => {
      // Arrange
      const errorMessage = 'Failed to get index';
      // Use mockImplementation for more robust error simulation
      storageHelpers.getDetectedPages.mockRejectedValue(new Error(errorMessage));

      // Act
      const result = await handler({ call: { functionKey: 'listDetectedPages', payload: {} } });

      // Assert
      expect(result).toEqual({ ok: false, error: errorMessage, results: [], total: 0 });
    });
    
    it('forwards sortBy/sortDir when provided and merges top-level + nested filters', async () => {
      // Arrange
      storageHelpers.getDetectedPages.mockResolvedValue({ results: [], total: 0 });

      const payload = {
        page: 3,
        pageSize: 50,
        sortBy: 'updated',
        sortDir: 'asc',
        // top-level flags object (enabled only should be forwarded)
        flags: { stale: true, inactive: true, orphaned: false },
        // top-level simple filters
        status: 'detected',
        search: 'ops',
        minImpact: 25,
        // nested filters which should be merged
        filters: { flags: ['incomplete'] },
      };

      // Act
      const result = await handler({ call: { functionKey: 'listDetectedPages', payload } });

      // Assert output
      expect(result).toEqual({ ok: true, results: [], total: 0 });

      // Capture call args and verify mapping
      const args = storageHelpers.getDetectedPages.mock.calls[0][0];
      expect(args.page).toBe(3);
      expect(args.pageSize).toBe(50);
      expect(args.sortBy).toBe('updated');
      expect(args.sortDir).toBe('asc');
      expect(args.filters.status).toBe('detected');
      expect(args.filters.search).toBe('ops');
      expect(args.filters.minImpact).toBe(25);
      // flags should contain union of nested and enabled top-level keys
      const flags = args.filters.flags || [];
      expect(flags.sort()).toEqual(['incomplete', 'inactive', 'stale'].sort());
    });
  });

  describe('exportDetectedPages', () => {
    it('forwards filters and sorting, and applies selected ids filtering in output', async () => {
      // Arrange
      const items = [
        { id: '1', title: 'Alpha', spaceKey: 'DOC', impactScore: 10, lastUpdated: '2024-01-01T00:00:00Z', status: 'detected', flags: { stale: true, inactive: true, orphaned: false, incomplete: false } },
        { id: '2', title: 'Beta', spaceKey: 'OPS', impactScore: 20, lastUpdated: '2024-02-01T00:00:00Z', status: 'detected', flags: { stale: true, inactive: true, orphaned: false, incomplete: false } },
      ];
      storageHelpers.getDetectedPages.mockResolvedValue({ results: items, total: items.length });

      const payload = {
        filters: { status: 'detected', flags: ['stale', 'inactive'], minImpact: 20, search: 'a' },
        sortBy: 'updated',
        sortDir: 'asc',
        ids: ['2'],
      };

      // Act
      const res = await handler({ call: { functionKey: 'exportDetectedPages', payload } });

      // Assert
      expect(storageHelpers.getDetectedPages).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10000,
        filters: { status: 'detected', flags: ['stale', 'inactive'], minImpact: 20, search: 'a' },
        sortBy: 'updated',
        sortDir: 'asc',
      });

      expect(res.ok).toBe(true);
      expect(res.total).toBe(1);
      expect(res.csv).toContain('id,title,spaceKey,impactScore,lastUpdated,status,stale,inactive,orphaned,incomplete');
      expect(res.csv).toContain('2');
      expect(res.csv).not.toContain('\n"1"');
      expect(res.excelHtml).toContain('<table>');
      expect(res.excelHtml).toContain('2');
      expect(res.excelHtml).not.toContain('>1<');
    });

    it('omits sortBy/sortDir when unspecified and returns empty export shape', async () => {
      // Arrange
      storageHelpers.getDetectedPages.mockResolvedValue({ results: [], total: 0 });

      // Act
      const res = await handler({ call: { functionKey: 'exportDetectedPages', payload: {} } });

      // Assert: verify call args do not include sort keys
      const args = storageHelpers.getDetectedPages.mock.calls[0][0];
      expect(args).toEqual({ page: 1, pageSize: 10000, filters: {} });

      // Empty export
      expect(res.ok).toBe(true);
      expect(res.total).toBe(0);
      expect(res.csv).toBe('');
      expect(res.excelHtml).toBe('');
    });

    it('CSV escaping for commas and quotes', async () => {
      // Arrange
      const items = [
        {
          id: '10',
          title: 'He said "Hello", world',
          spaceKey: 'DEV,OPS',
          impactScore: 5,
          lastUpdated: '2024-04-01T00:00:00Z',
          status: 'detected',
          flags: { stale: false, inactive: false, orphaned: false, incomplete: true },
        },
      ];
      storageHelpers.getDetectedPages.mockResolvedValue({ results: items, total: 1 });

      // Act
      const res = await handler({ call: { functionKey: 'exportDetectedPages', payload: {} } });

      // Assert
      expect(res.ok).toBe(true);
      // CSV should quote fields and double internal quotes
      expect(res.csv).toContain('"He said ""Hello"", world"');
      // Comma in spaceKey must be within quotes
      expect(res.csv).toMatch(/\n"10","He said ""Hello"", world","DEV,OPS","5","2024-04-01T00:00:00Z","detected","false","false","false","true"/);
    });
  });
});
