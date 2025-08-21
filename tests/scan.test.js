import './setup.js';
import { _performScan, runRealScan, runSimulatedScan } from '../src/backend/services/scan';
import * as storage from '../src/backend/storage';
import * as confluence from '../src/backend/services/confluence';

// Mock the dependencies
jest.mock('../src/backend/storage');
jest.mock('../src/backend/services/confluence');

describe('_performScan', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementations
    storage.getSettingsFromStore.mockResolvedValue({
      rules: {
        stale: { enabled: true, period: 30 },
        incomplete: { enabled: true, pattern: 'TODO' },
        inactive: { enabled: true, period: 90 },
        orphaned: { enabled: false },
      },
      whitelist: { pageIds: [], spaceKeys: [] },
    });
    storage.getMany.mockResolvedValue({});
    storage.getIndex.mockResolvedValue([]); // Mock getIndex to prevent TypeError in finalizeScan
    storage.putDetectedItem.mockResolvedValue(undefined); // Explicitly mock to enable call tracking
    storage.getScanState.mockResolvedValue(null); // persisted state
    // New helpers default mocks
    storage.setScanState && storage.setScanState.mockResolvedValue(undefined);
    storage.clearScanState && storage.clearScanState.mockResolvedValue(undefined);
    storage.getLock && storage.getLock.mockResolvedValue(null);
    storage.setLock && storage.setLock.mockResolvedValue(undefined);
    storage.clearLock && storage.clearLock.mockResolvedValue(undefined);
    // Mock the retry-wrapper function that scan.js actually calls
    confluence.getPagesBatchV2WithRetry.mockResolvedValue({ ok: true, body: { results: [], cursor: null } });
    confluence.hasChildPages.mockResolvedValue({ ok: true, hasChild: false }); // Assume no children by default
    // Default space key resolution for tests that don't care about it
    confluence.getSpaceKeyById.mockResolvedValue({ ok: true, key: 'SPACE' });
  });

  it('should perform a basic scan, detect a stale and incomplete page, and save it', async () => {
    // Arrange: Mock a single page that is old and has no labels
    const mockPage = {
      id: '101',
      title: 'Old Page with TODO',
      spaceId: '1',
      version: { 
        createdAt: '2020-01-01T00:00:00.000Z', 
        updatedAt: '2020-01-01T00:00:00.000Z' // Stale
      },
      labels: { results: [], size: 0 }, // Incomplete
      body: { view: { value: 'test content' } },
      parentId: '100',
    };

    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [mockPage], cursor: null } });

    // Act
    // Since we are calling the core logic directly, we pass the settings mock
    const settings = await storage.getSettingsFromStore();
    const result = await _performScan(settings);

    // Assert
    expect(confluence.getPagesBatchV2WithRetry).toHaveBeenCalledTimes(1);
    // The scan runs across all spaces, so spaceId is not passed here
    expect(confluence.getPagesBatchV2WithRetry).toHaveBeenCalledWith({ cursor: null, limit: 50 });
    
    // Check that putDetectedItem was called for the detected page
    expect(storage.putDetectedItem).toHaveBeenCalledTimes(1);
    const detectedData = storage.putDetectedItem.mock.calls[0][1];
    expect(detectedData.id).toBe('101');
    expect(detectedData.title).toBe('Old Page with TODO');
    expect(detectedData.flags.stale).toBe(true);
    expect(detectedData.flags.incomplete).toBe(true);
    expect(detectedData.flags.orphaned).toBe(false); // hasChildPages was mocked to false
    expect(detectedData.impactScore).toBeGreaterThan(0);

    // Check that the final index is updated
    expect(storage.setIndex).toHaveBeenCalledWith('detected:index', ['101']);

    // Check the summary result
    expect(result.detected).toBe(1);
  });

  it('should keep orphaned=false when page has children', async () => {
    // Arrange
    const page = {
      id: 'O2',
      title: 'TODO: has children', // ensure detection via incomplete
      version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
    };
    const settings = await storage.getSettingsFromStore();
    settings.rules.orphaned = { enabled: true };
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });
    confluence.hasChildPages.mockResolvedValueOnce({ ok: true, hasChild: true });

    // Act
    const result = await _performScan(settings);

    // Assert
    expect(storage.putDetectedItem).toHaveBeenCalledTimes(1);
    expect(storage.putDetectedItem).toHaveBeenCalledWith('O2', expect.objectContaining({
      flags: expect.objectContaining({ orphaned: false, incomplete: true }),
    }));
    expect(result.detected).toBe(1);
  });

  it('should default orphaned=false when hasChildPages fails', async () => {
    // Arrange
    const page = { id: 'O3', title: 'TODO orphaned?', version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' } };
    const settings = await storage.getSettingsFromStore();
    settings.rules.orphaned = { enabled: true };
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });
    confluence.hasChildPages.mockResolvedValueOnce({ ok: false, hasChild: false });

    // Act
    const result = await _performScan(settings);

    // Assert
    expect(storage.putDetectedItem).toHaveBeenCalledWith('O3', expect.objectContaining({
      flags: expect.objectContaining({ orphaned: false })
    }));
    expect(result.detected).toBe(1);
  });

  it('should not call hasChildPages when orphaned rule is disabled', async () => {
    // Arrange
    const page = { id: 'O4', title: 'TODO page', version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' } };
    const settings = await storage.getSettingsFromStore();
    settings.rules.orphaned = { enabled: false };
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    await _performScan(settings);

    // Assert
    expect(confluence.hasChildPages).not.toHaveBeenCalled();
  });

  it('should resolve spaceKey even when whitelist.spaceKeys is empty', async () => {
    // Arrange
    const page = { id: 'S1', title: 'TODO page', spaceId: '999', version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' } };
    const settings = await storage.getSettingsFromStore();
    settings.whitelist.spaceKeys = [];
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    await _performScan(settings);

    // Assert
    expect(confluence.getSpaceKeyById).toHaveBeenCalledTimes(1);
    expect(confluence.getSpaceKeyById).toHaveBeenCalledWith('999');
  });

  it('should process page without spaceId (no spaceKey lookup)', async () => {
    // Arrange
    const page = { id: 'S2', title: 'TODO page', /* no spaceId */ version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' } };
    const settings = await storage.getSettingsFromStore();
    settings.whitelist.spaceKeys = ['ABC'];
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    await _performScan(settings);

    // Assert
    expect(confluence.getSpaceKeyById).not.toHaveBeenCalled();
    expect(storage.putDetectedItem).toHaveBeenCalledWith('S2', expect.any(Object));
  });

  it('should not exclude page when getSpaceKeyById fails', async () => {
    // Arrange
    const page = { id: 'S3', title: 'TODO page', spaceId: '42', version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' } };
    const settings = await storage.getSettingsFromStore();
    settings.whitelist.spaceKeys = ['ABC'];
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.getSpaceKeyById.mockResolvedValueOnce({ ok: false });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    await _performScan(settings);

    // Assert
    expect(storage.putDetectedItem).toHaveBeenCalledWith('S3', expect.any(Object));
  });

  it('should cap impactScore at 100 when all flags are active', async () => {
    // Arrange
    const page = {
      id: 'I1',
      title: 'TODO everything',
      version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' },
    };
    const settings = await storage.getSettingsFromStore();
    settings.rules.orphaned = { enabled: true };
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.hasChildPages.mockResolvedValueOnce({ ok: true, hasChild: false });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    await _performScan(settings);

    // Assert
    const saved = storage.putDetectedItem.mock.calls.find((c) => c[0] === 'I1')[1];
    expect(saved.impactScore).toBe(100);
    expect(saved.flags).toEqual(expect.objectContaining({ stale: true, inactive: true, orphaned: true, incomplete: true }));
  });

  it('should compute correct impactScore for partial flags', async () => {
    // Arrange: only stale=true (base 10 + 40 = 50)
    const page = { id: 'I2', title: 'regular', version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' } };
    const settings = await storage.getSettingsFromStore();
    settings.rules.incomplete.enabled = false;
    settings.rules.inactive.enabled = false;
    settings.rules.orphaned.enabled = false;
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    await _performScan(settings);

    // Assert
    const saved = storage.putDetectedItem.mock.calls.find((c) => c[0] === 'I2')[1];
    expect(saved.impactScore).toBe(50);
  });

  it('should handle pagination where a later batch fails (no finalize)', async () => {
    // Arrange
    const first = { id: 'P1', title: 'TODO first', version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' } };
    const settings = await storage.getSettingsFromStore();
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.getPagesBatchV2WithRetry
      .mockResolvedValueOnce({ ok: true, body: { results: [first], _links: { next: '/rest?cursor=abc' } } })
      .mockResolvedValueOnce({ ok: false, status: 503, body: {} });

    // Act / Assert
    await expect(_performScan(settings)).rejects.toThrow('Confluence API error: 503');
    // First item was saved before failure
    expect(storage.putDetectedItem).toHaveBeenCalledWith('P1', expect.any(Object));
    // finalizeScan not called
    expect(storage.setIndex).not.toHaveBeenCalled();
  });

  it('should preserve non-detected status when re-detected (e.g., archived)', async () => {
    // Arrange
    const page = { id: 'A1', title: 'TODO archived', version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' } };
    storage.getIndex.mockResolvedValue([]);
    storage.getMany.mockResolvedValue({ 'detected:A1': { id: 'A1', status: 'archived' } });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    const result = await _performScan(await storage.getSettingsFromStore());

    // Assert
    expect(storage.putDetectedItem).toHaveBeenCalledWith('A1', expect.objectContaining({ status: 'archived' }));
    expect(result).toEqual({ detected: 1, total: 1 });
  });

  it('should map legacy includeOrphaned=true and detect orphaned', async () => {
    // Arrange
    const legacy = { rules: { includeOrphaned: true, includeIncomplete: false }, whitelist: { pageIds: [], spaceKeys: [] } };
    const page = { id: 'LO1', title: 'no todo', version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' } };
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });
    confluence.hasChildPages.mockResolvedValueOnce({ ok: true, hasChild: false });

    // Act
    const result = await _performScan(legacy);

    // Assert
    expect(storage.putDetectedItem).toHaveBeenCalledWith('LO1', expect.objectContaining({
      flags: expect.objectContaining({ orphaned: true })
    }));
    expect(result.detected).toBe(1);
  });

  it('should not crash on pages missing title/version (no flags)', async () => {
    // Arrange
    const page = { id: 'MF1' }; // no title/version
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    const result = await _performScan(await storage.getSettingsFromStore());

    // Assert
    expect(storage.putDetectedItem).not.toHaveBeenCalled();
    expect(result).toEqual({ detected: 0, total: 0 });
  });

  it('should handle pagination and process multiple batches', async () => {
    // Arrange
    const mockSettings = {
      rules: {
        stale: { enabled: true, period: 30 },
        incomplete: { enabled: true, pattern: 'TODO' },
        inactive: { enabled: true, period: 90 },
        orphaned: { enabled: false },
      },
      whitelist: { pageIds: [], spaceKeys: [] },
    };

    const mockPage1 = {
      id: '201',
      title: 'Page One - Stale',
      version: {
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z', // Make it actually stale
      },
    };

    const mockPage2 = {
      id: '202',
      title: 'Page Two - TODO Incomplete',
      version: {
        createdAt: '2024-01-01T12:00:00.000Z', // Give it some age for impact score
        updatedAt: new Date().toISOString(),
      },
    };

    storage.getSettingsFromStore.mockResolvedValue(mockSettings);
    storage.getIndex.mockResolvedValue([]);
    // Simulate that page 201 is new, but 202 has been seen before and was recently updated.
    storage.getMany.mockResolvedValue([
      null, 
      { id: '202', lastUpdated: new Date().toISOString() }
    ]);

    // Mock pagination: first call returns a page and a cursor, second call returns a page and no cursor
    confluence.getPagesBatchV2WithRetry
      .mockResolvedValueOnce({ ok: true, body: { results: [mockPage1], _links: { next: '/rest/api/content?cursor=cursor-123' } } })
      .mockResolvedValueOnce({ ok: true, body: { results: [mockPage2], _links: {} } });

    // Act
    const settings = await storage.getSettingsFromStore();
    const result = await _performScan(settings);

    // Assert
    expect(confluence.getPagesBatchV2WithRetry).toHaveBeenCalledTimes(2);
    expect(confluence.getPagesBatchV2WithRetry).toHaveBeenCalledWith({ cursor: null, limit: 50 });
    expect(confluence.getPagesBatchV2WithRetry).toHaveBeenCalledWith({ cursor: 'cursor-123', limit: 50 });

    expect(storage.putDetectedItem).toHaveBeenCalledTimes(2);
    // Be very specific about the expected flags for each page
    // Page 201 is old in every way
    expect(storage.putDetectedItem).toHaveBeenCalledWith('201', expect.objectContaining({ 
      flags: { stale: true, inactive: true, incomplete: false, orphaned: false } 
    }));
    // Page 202 was recently updated (not stale), but its title contains 'TODO' (incomplete)
    expect(storage.putDetectedItem).toHaveBeenCalledWith('202', expect.objectContaining({ 
      flags: { stale: false, inactive: false, incomplete: true, orphaned: false } 
    }));

    expect(storage.setIndex).toHaveBeenCalledTimes(1);
    expect(storage.setIndex).toHaveBeenCalledWith('detected:index', ['201', '202']);

    expect(result).toEqual({ detected: 2, total: 2 });
  });

  it('should preserve items with non-detected status from previous scans', async () => {
    // Arrange
    const mockSettings = {
      rules: {
        stale: { enabled: true, period: 30 },
        incomplete: { enabled: false },
        inactive: { enabled: false },
        orphaned: { enabled: false },
      },
      whitelist: { pageIds: [], spaceKeys: [] },
    };

    const newPage = {
      id: '101',
      title: 'A new stale page',
      version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' },
    };

    const oldIgnoredItemId = '999';
    const oldIgnoredItem = { id: oldIgnoredItemId, status: 'ignored' };

    storage.getSettingsFromStore.mockResolvedValue(mockSettings);
    // Mock that a previous scan found an item with ID '999'
    storage.getIndex.mockResolvedValue([oldIgnoredItemId]);
    // Mock that the item '999' has been marked as 'ignored' by the user
    storage.getMany.mockImplementation(keys => {
      const result = {};
      if (keys.includes(`detected:${oldIgnoredItemId}`)) {
        result[`detected:${oldIgnoredItemId}`] = oldIgnoredItem;
      }
      return Promise.resolve(result);
    });

    // The current scan finds a new page
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [newPage], cursor: null } });

    // Act
    const settings = await storage.getSettingsFromStore();
    const result = await _performScan(settings);

    // Assert
    // Check that the final index contains both the new page and the preserved ignored page
    expect(storage.setIndex).toHaveBeenCalledTimes(1);
    const finalIndex = storage.setIndex.mock.calls[0][1];
    expect(finalIndex).toHaveLength(2);
    expect(finalIndex.sort()).toEqual([newPage.id, oldIgnoredItemId].sort());

    // Check that putDetectedItem was only called for the new page
    expect(storage.putDetectedItem).toHaveBeenCalledTimes(1);
    expect(storage.putDetectedItem).toHaveBeenCalledWith(newPage.id, expect.any(Object));

    // Check the summary: 1 new item detected, 2 total items in the index
    expect(result).toEqual({ detected: 1, total: 2 });
  });

  it('should not detect a page that does not meet any flag criteria', async () => {
    // Arrange
    const healthyPage = {
      id: '201',
      title: 'A perfectly fine and up-to-date page',
      version: { 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      },
    };
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [healthyPage], cursor: null } });

    // Act
    const settings = await storage.getSettingsFromStore();
    const result = await _performScan(settings);

    // Assert
    expect(storage.putDetectedItem).not.toHaveBeenCalled();
    expect(storage.setIndex).toHaveBeenCalledWith('detected:index', []);
    expect(result).toEqual({ detected: 0, total: 0 });
  });

  it('should not detect a page that is in a whitelisted space (spaceKeys)', async () => {
    // Arrange
    const page = {
      id: 'WS1',
      title: 'Very old but whitelisted by space',
      spaceId: '42',
      version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' },
    };
    const settingsWithSpaceWl = await storage.getSettingsFromStore();
    settingsWithSpaceWl.whitelist.spaceKeys = ['ABC'];
    storage.getSettingsFromStore.mockResolvedValue(settingsWithSpaceWl);
    confluence.getSpaceKeyById.mockResolvedValueOnce({ ok: true, key: 'ABC' });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    const result = await _performScan(settingsWithSpaceWl);

    // Assert
    expect(storage.putDetectedItem).not.toHaveBeenCalled();
    expect(storage.setIndex).toHaveBeenCalledWith('detected:index', []);
    expect(result).toEqual({ detected: 0, total: 0 });
  });

  it('should set orphaned flag when page has no children and orphaned rule enabled', async () => {
    // Arrange
    const page = {
      id: 'O1',
      title: 'Orphaned page',
      version: { createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    };
    const settings = await storage.getSettingsFromStore();
    settings.rules.orphaned = { enabled: true };
    storage.getSettingsFromStore.mockResolvedValue(settings);
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });
    confluence.hasChildPages.mockResolvedValueOnce({ ok: true, hasChild: false });

    // Act
    const result = await _performScan(settings);

    // Assert
    expect(storage.putDetectedItem).toHaveBeenCalledTimes(1);
    expect(storage.putDetectedItem).toHaveBeenCalledWith('O1', expect.objectContaining({
      flags: expect.objectContaining({ orphaned: true }),
    }));
    expect(result.detected).toBe(1);
  });

  it('should not detect a page that is on the whitelist', async () => {
    // Arrange
    const whitelistedPageId = '301';
    const staleButWhitelistedPage = {
      id: whitelistedPageId,
      title: 'This page is old but we want to keep it',
      version: { 
        createdAt: '2020-01-01T00:00:00.000Z', 
        updatedAt: '2020-01-01T00:00:00.000Z' 
      },
    };

    const settingsWithWhitelist = await storage.getSettingsFromStore();
    settingsWithWhitelist.whitelist.pageIds.push(whitelistedPageId);
    storage.getSettingsFromStore.mockResolvedValue(settingsWithWhitelist);

    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [staleButWhitelistedPage], cursor: null } });

    // Act
    const result = await _performScan(settingsWithWhitelist);

    // Assert
    expect(storage.putDetectedItem).not.toHaveBeenCalled();
    expect(storage.setIndex).toHaveBeenCalledWith('detected:index', []);
    expect(result).toEqual({ detected: 0, total: 0 });
  });

  it('should remove previously detected items that are no longer flagged', async () => {
    // Arrange: previous index contains one detected item, new scan finds nothing
    storage.getIndex.mockResolvedValue(['777']);
    storage.getMany.mockImplementation(async (keys) => {
      const out = {};
      for (const k of keys) {
        out[k] = k === 'detected:777' ? { id: '777', status: 'detected' } : null;
      }
      return out;
    });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });

    // Act
    const settings = await storage.getSettingsFromStore();
    const result = await _performScan(settings);

    // Assert
    expect(storage.putDetectedItem).not.toHaveBeenCalled();
    expect(storage.setIndex).toHaveBeenCalledWith('detected:index', []);
    expect(result).toEqual({ detected: 0, total: 0 });
  });

  it('should preserve archived items from previous scans when no longer flagged', async () => {
    // Arrange: previous index contains archived item, new scan finds nothing
    storage.getIndex.mockResolvedValue(['888']);
    storage.getMany.mockImplementation(async (keys) => {
      const out = {};
      for (const k of keys) {
        out[k] = k === 'detected:888' ? { id: '888', status: 'archived' } : null;
      }
      return out;
    });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });

    // Act
    const settings = await storage.getSettingsFromStore();
    const result = await _performScan(settings);

    // Assert
    expect(storage.putDetectedItem).not.toHaveBeenCalled();
    expect(storage.setIndex).toHaveBeenCalledWith('detected:index', ['888']);
    expect(result).toEqual({ detected: 0, total: 1 });
  });

  it('should not crash on invalid incomplete pattern and use fallback safely', async () => {
    // Arrange
    const badSettings = {
      rules: {
        stale: { enabled: false },
        inactive: { enabled: false },
        orphaned: { enabled: false },
        incomplete: { enabled: true, pattern: '(' }, // invalid regex
      },
      whitelist: { pageIds: [], spaceKeys: [] },
    };
    const page = { id: 'x1', title: 'A regular page', version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' } };
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    const result = await _performScan(badSettings);

    // Assert
    expect(storage.putDetectedItem).not.toHaveBeenCalled();
    expect(storage.setIndex).toHaveBeenCalledWith('detected:index', []);
    expect(result).toEqual({ detected: 0, total: 0 });
  });

  it('should handle legacy settings shape (ageDays/inactivityDays/includeIncomplete)', async () => {
    // Arrange
    const legacySettings = {
      rules: { ageDays: 30, inactivityDays: 90, includeIncomplete: true },
      whitelist: [],
    };
    const legacyPage = {
      id: 'L1',
      title: 'TODO: legacy',
      version: { createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    };
    storage.getIndex.mockResolvedValue([]);
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [legacyPage], _links: {} } });

    // Act
    const result = await _performScan(legacySettings);

    // Assert
    expect(storage.putDetectedItem).toHaveBeenCalledWith('L1', expect.objectContaining({
      flags: expect.objectContaining({ stale: true, inactive: true, incomplete: true }),
    }));
    expect(storage.setIndex).toHaveBeenCalledWith('detected:index', ['L1']);
    expect(result).toEqual({ detected: 1, total: 1 });
  });

  it('should set last scan timestamp during finalizeScan', async () => {
    // Arrange
    const page = { id: 'TS1', title: 'TODO', version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' } };
    storage.getIndex.mockResolvedValue([]);
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    await _performScan(await storage.getSettingsFromStore());

    // Assert
    expect(storage.setLastScan).toHaveBeenCalledTimes(1);
    expect(storage.setLastScan.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('runRealScan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.getSettingsFromStore.mockResolvedValue({
      rules: {
        stale: { enabled: true, period: 30 },
        incomplete: { enabled: true, pattern: 'TODO' },
        inactive: { enabled: true, period: 90 },
        orphaned: { enabled: false },
      },
      whitelist: { pageIds: [], spaceKeys: [] },
    });
    storage.getIndex.mockResolvedValue([]);
    confluence.getPagesBatchV2WithRetry.mockResolvedValue({ ok: true, body: { results: [], _links: {} } });
    // Defaults for new helpers
    storage.getLock && storage.getLock.mockResolvedValue(null);
    storage.setLock && storage.setLock.mockResolvedValue(undefined);
    storage.clearLock && storage.clearLock.mockResolvedValue(undefined);
    storage.getScanState && storage.getScanState.mockResolvedValue(null);
    storage.setScanState && storage.setScanState.mockResolvedValue(undefined);
    storage.clearScanState && storage.clearScanState.mockResolvedValue(undefined);
  });

  it('should return { ok: false, error } when underlying scan throws', async () => {
    // Arrange: make API return error response to trigger throw in processPageBatch
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: false, status: 500, body: {} });

    // Act
    const res = await runRealScan();

    // Assert
    expect(res).toEqual(expect.objectContaining({ ok: false }));
    expect(String(res.error)).toContain('Confluence API error: 500');
    expect(storage.putDetectedItem).not.toHaveBeenCalled();
    expect(storage.setIndex).not.toHaveBeenCalled();
  });

  it('should acquire and release lock when none exists and persist state between batches', async () => {
    // Arrange
    storage.getLock.mockResolvedValue(null);
    const page1 = { id: 'R1', title: 'TODO 1', version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' } };
    // First batch with next cursor
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page1], _links: { next: '...cursor=CURSOR_NEXT' } } });
    // Second (final) empty batch
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });

    // Act
    const res = await runRealScan();

    // Assert
    expect(storage.setLock).toHaveBeenCalled();
    expect(storage.setLock.mock.calls[0][0]).toEqual(expect.objectContaining({ timestamp: expect.any(Number), mode: 'real' }));
    expect(storage.setScanState).toHaveBeenCalled();
    const persistedState = storage.setScanState.mock.calls[storage.setScanState.mock.calls.length - 1][0];
    expect(persistedState.phase).toBe('processing');
    expect(persistedState.progress.cursor).toBe('CURSOR_NEXT');
    expect(storage.clearScanState).toHaveBeenCalledTimes(1);
    expect(storage.clearLock).toHaveBeenCalledTimes(1);
    expect(res).toEqual(expect.objectContaining({ detected: 1, total: 1, duration: expect.any(Number) }));
  });

  it('should not acquire or release lock when an active lock exists', async () => {
    // Arrange: existing active lock
    storage.getLock.mockResolvedValue({ timestamp: Date.now() });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });

    // Act
    const res = await runRealScan();

    // Assert
    expect(storage.setLock).not.toHaveBeenCalled();
    expect(storage.clearLock).not.toHaveBeenCalled();
    expect(res).toEqual(expect.objectContaining({ detected: 0, total: 0 }));
  });

  it('should resume from persisted state (cursor) and clear state after success', async () => {
    // Arrange: saved state after first batch
    const savedState = {
      status: 'running',
      phase: 'processing',
      progress: { cursor: 'C2', processedCount: 50 },
      allProcessedIds: ['Z1'],
      settings: { rules: { stale: { enabled: true, period: 30 }, inactive: { enabled: true, period: 90 }, orphaned: { enabled: false }, incomplete: { enabled: true, pattern: 'TODO' } }, whitelist: { pageIds: [], spaceKeys: [] } },
      startedAt: new Date().toISOString(),
    };
    storage.getScanState.mockResolvedValue(savedState);
    // Next (final) batch: one item and no next
    const page2 = { id: 'Z2', title: 'TODO 2', version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' } };
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page2], _links: {} } });

    // Act
    const res = await runRealScan();

    // Assert
    expect(confluence.getPagesBatchV2WithRetry).toHaveBeenCalledWith({ cursor: 'C2', limit: 50 });
    expect(storage.clearScanState).toHaveBeenCalledTimes(1);
    expect(res).toEqual(expect.objectContaining({ detected: 2, total: 2 }));
  });

  it('should persist state and not clear it when error occurs mid-scan', async () => {
    // Arrange: first batch ok with next, second fails
    const page1 = { id: 'E1', title: 'TODO E1', version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' } };
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page1], _links: { next: '...cursor=CURSOR_ERR' } } });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: false, status: 500, body: {} });

    // Act
    const res = await runRealScan();

    // Assert
    expect(storage.setScanState).toHaveBeenCalled();
    expect(storage.clearScanState).not.toHaveBeenCalled();
    expect(res).toEqual(expect.objectContaining({ ok: false }));
  });

  it('should acquire lock if existing lock is expired (TTL takeover) and release it on success', async () => {
    // Arrange: expired lock (older than 10 minutes TTL)
    const expiredTs = Date.now() - (10 * 60 * 1000) - 1000;
    storage.getLock.mockResolvedValue({ timestamp: expiredTs, mode: 'real' });
    // One simple empty batch to finalize immediately
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });

    // Act
    const res = await runRealScan();

    // Assert: new lock acquired and cleared
    expect(storage.setLock).toHaveBeenCalledTimes(1);
    expect(storage.clearLock).toHaveBeenCalledTimes(1);
    expect(res).toEqual(expect.objectContaining({ detected: 0, total: 0 }));
  });

  it('should refresh lock heartbeat between processing batches', async () => {
    // Arrange: active lock exists (owned by caller)
    storage.getLock.mockResolvedValue({ timestamp: Date.now(), mode: 'scheduled' });
    const page = { id: 'HB1', title: 'TODO HB', version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' } };
    // First batch has next -> causes heartbeat; second finalizes
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: { next: '...cursor=NEXT_HB' } } });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });

    // Act
    const res = await runRealScan();

    // Assert: did not acquire new lock, but refreshed it at least once
    expect(storage.setLock).toHaveBeenCalled();
    expect(storage.setLock.mock.calls.some(([arg]) => arg && arg.mode === 'scheduled')).toBe(true);
    expect(storage.clearLock).not.toHaveBeenCalled();
    expect(res).toEqual(expect.objectContaining({ detected: 1, total: 1 }));
  });

  it('should clear its own lock when error occurs and it acquired the lock', async () => {
    // Arrange: no lock initially, acquire then error in second batch
    storage.getLock.mockResolvedValue(null);
    const page = { id: 'ERRL1', title: 'TODO', version: { createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' } };
    confluence.getPagesBatchV2WithRetry
      .mockResolvedValueOnce({ ok: true, body: { results: [page], _links: { next: '...cursor=C' } } })
      .mockResolvedValueOnce({ ok: false, status: 500, body: {} });

    // Act
    const res = await runRealScan();

    // Assert: lock was acquired (at least once) and cleared in finally
    expect(storage.setLock).toHaveBeenCalled();
    expect(storage.clearLock).toHaveBeenCalledTimes(1);
    expect(res).toEqual(expect.objectContaining({ ok: false }));
  });

  it('should reinitialize when saved state is invalid (missing phase)', async () => {
    // Arrange: invalid state missing phase should be ignored
    storage.getScanState.mockResolvedValue({ progress: { cursor: 'OLD' } });
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });

    // Act
    await runRealScan();

    // Assert: starts from null cursor (not from OLD)
    expect(confluence.getPagesBatchV2WithRetry).toHaveBeenCalledWith({ cursor: null, limit: 50 });
  });

  it('should prefer saved state settings over newly loaded settings when resuming', async () => {
    // Arrange: saved pattern "XXX" should be used instead of newly loaded "TODO"
    storage.getScanState.mockResolvedValue({
      status: 'running',
      phase: 'processing',
      progress: { cursor: null, processedCount: 0 },
      allProcessedIds: [],
      settings: { rules: { stale: { enabled: false }, inactive: { enabled: false }, orphaned: { enabled: false }, incomplete: { enabled: true, pattern: 'XXX' } }, whitelist: { pageIds: [], spaceKeys: [] } },
      startedAt: new Date().toISOString(),
    });
    // Page matches XXX but not TODO
    const page = { id: 'PAT1', title: 'XXX marker', version: { createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' } };
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [page], _links: {} } });

    // Act
    const res = await runRealScan();

    // Assert: detected using saved pattern
    expect(res).toEqual(expect.objectContaining({ detected: 1, total: 1 }));
  });

  it('should ignore errors from clearScanState after success', async () => {
    // Arrange
    storage.clearScanState.mockRejectedValueOnce(new Error('perm issue'));
    confluence.getPagesBatchV2WithRetry.mockResolvedValueOnce({ ok: true, body: { results: [], _links: {} } });

    // Act
    const res = await runRealScan();

    // Assert: still success
    expect(res).toEqual(expect.objectContaining({ detected: 0, total: 0 }));
  });
});

describe('runSimulatedScan', () => {
  it('should return count from detected index and last scan', async () => {
    // Arrange
    storage.getIndex.mockResolvedValue(['1', '2']);
    // runSimulatedScan reads last scan via @forge/api.storage in scan.js; mock via global setup
    const { storage: forgeStorage } = require('@forge/api');
    forgeStorage.get.mockResolvedValue('2025-01-01T00:00:00.000Z');

    // Act
    const res = await runSimulatedScan();

    // Assert
    expect(res).toEqual({ ok: true, created: 0, total: 2, lastScan: '2025-01-01T00:00:00.000Z', mode: 'simulated' });
  });
});
