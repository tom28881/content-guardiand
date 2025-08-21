const { describe, it, expect, beforeEach } = require('@jest/globals');
require('./setup.js');

// Import after setup to ensure mocks are in place
const { 
  getIndex, 
  setIndex, 
  getSettingsFromStore, 
  getMany, 
  putDetectedItem, 

  addAuditLogEntry,
  getAuditLog,
  getDetectedPages,
  STORAGE_KEYS 
} = require('../src/backend/storage.js');

describe('Storage Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getIndex', () => {
    it('should return empty array when key does not exist', async () => {
      mockStorage.get.mockResolvedValue(null);
      
      const result = await getIndex('test-key');
      
      expect(result).toEqual([]);
      expect(mockStorage.get).toHaveBeenCalledWith('test-key');
    });

    it('should return stored array when key exists', async () => {
      const testData = ['item1', 'item2', 'item3'];
      mockStorage.get.mockResolvedValue(testData);
      
      const result = await getIndex('test-key');
      
      expect(result).toEqual(testData);
      expect(mockStorage.get).toHaveBeenCalledWith('test-key');
    });
  });

  describe('setIndex', () => {
    it('should store array with given key', async () => {
      const testData = ['item1', 'item2'];
      
      await setIndex('test-key', testData);
      
      expect(mockStorage.set).toHaveBeenCalledWith('test-key', testData);
    });

    it('should store empty array when ids is null', async () => {
      await setIndex('test-key', null);
      
      expect(mockStorage.set).toHaveBeenCalledWith('test-key', []);
    });
  });

  describe('getSettingsFromStore', () => {
    it('should return empty object when no settings exist', async () => {
      mockStorage.get.mockResolvedValue(null);
      
      const result = await getSettingsFromStore();
      
      expect(result).toEqual({});
      expect(mockStorage.get).toHaveBeenCalledWith(STORAGE_KEYS.SETTINGS);
    });

    it('should return stored settings', async () => {
      const testSettings = { rules: { ageDays: 365 }, whitelist: { spaceKeys: ['TEST'] } };
      mockStorage.get.mockResolvedValue(testSettings);
      
      const result = await getSettingsFromStore();
      
      expect(result).toEqual(testSettings);
    });
  });

  describe('getMany', () => {
    it('should fetch multiple keys in chunks', async () => {
      const keys = Array.from({ length: 250 }, (_, i) => `key-${i}`);
      const mockValues = keys.map((key, i) => ({ id: key, value: i }));
      
      // Mock storage.get to return different values for different keys
      mockStorage.get.mockImplementation((key) => {
        const index = keys.indexOf(key);
        return Promise.resolve(index >= 0 ? mockValues[index] : null);
      });
      
      const result = await getMany(keys);
      
      // Should have called storage.get for each key
      expect(mockStorage.get).toHaveBeenCalledTimes(250);
      
      // Should return object with all keys
      expect(Object.keys(result)).toHaveLength(250);
      expect(result['key-0']).toEqual({ id: 'key-0', value: 0 });
      expect(result['key-249']).toEqual({ id: 'key-249', value: 249 });
    });

    it('should handle null values correctly', async () => {
      const keys = ['existing-key', 'missing-key'];
      mockStorage.get.mockImplementation((key) => {
        if (key === 'existing-key') return Promise.resolve({ data: 'test' });
        return Promise.resolve(null);
      });
      
      const result = await getMany(keys);
      
      expect(result['existing-key']).toEqual({ data: 'test' });
      expect(result['missing-key']).toBeNull();
    });

    it('should process keys in chunks of 100', async () => {
      const keys = Array.from({ length: 150 }, (_, i) => `key-${i}`);
      mockStorage.get.mockResolvedValue({ test: 'data' });
      
      await getMany(keys);
      
      // Should be called 150 times (all keys)
      expect(mockStorage.get).toHaveBeenCalledTimes(150);
    });
  });

  describe('putDetectedItem', () => {
    it('should store detected item with correct key', async () => {
      const item = { id: '123', title: 'Test Page', flags: { stale: true } };
      
      await putDetectedItem('123', item);
      
      expect(mockStorage.set).toHaveBeenCalledWith('detected:123', item);
    });
  });



  describe('addAuditLogEntry', () => {
    it('should add audit entry and update index', async () => {
      const existingIndex = ['entry1', 'entry2'];
      mockStorage.get.mockResolvedValue(existingIndex);
      
      const entry = {
        action: 'archive',
        pageId: '123',
        pageTitle: 'Test Page',
        user: 'test-user'
      };
      
      await addAuditLogEntry(entry);
      
      // Should get existing index
      expect(mockStorage.get).toHaveBeenCalledWith(STORAGE_KEYS.AUDIT_INDEX);
      
      // Should store the entry with generated ID
      expect(mockStorage.set).toHaveBeenCalledWith(
        expect.stringMatching(/^audit:test-uuid-123$/),
        expect.objectContaining({
          ...entry,
          id: 'test-uuid-123',
          timestamp: expect.any(String)
        })
      );
      
      // Should update index
      expect(mockStorage.set).toHaveBeenCalledWith(
        STORAGE_KEYS.AUDIT_INDEX,
        ['test-uuid-123', 'entry1', 'entry2']
      );
    });
  });

  describe('getAuditLog', () => {
    it('should return paginated audit log entries', async () => {
      const mockIndex = ['entry3', 'entry2', 'entry1'];
      const mockEntries = {
        'audit:entry1': { id: 'entry1', action: 'archive', ts: '2025-01-01T00:00:00Z' },
        'audit:entry2': { id: 'entry2', action: 'whitelist', ts: '2025-01-02T00:00:00Z' },
        'audit:entry3': { id: 'entry3', action: 'tag', ts: '2025-01-03T00:00:00Z' }
      };
      
      mockStorage.get.mockImplementation((key) => {
        if (key === STORAGE_KEYS.AUDIT_INDEX) return Promise.resolve(mockIndex);
        return Promise.resolve(mockEntries[key] || null);
      });
      
      const result = await getAuditLog({ page: 1, pageSize: 2 });
      
      expect(result.ok).toBe(true);
      expect(result.total).toBe(3);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe('entry3'); // Most recent first
      expect(result.items[1].id).toBe('entry2');
    });

    it('should handle empty audit log', async () => {
      mockStorage.get.mockResolvedValue([]);
      
      const result = await getAuditLog();
      
      expect(result.ok).toBe(true);
      expect(result.total).toBe(0);
      expect(result.items).toEqual([]);
    });
  });

  describe('getDetectedPages', () => {
    const seedDetected = (items) => {
      const index = items.map((x) => String(x.id));
      mockStorage.get.mockImplementation((key) => {
        if (key === 'detected:index') return Promise.resolve(index);
        if (String(key).startsWith('detected:')) {
          const id = String(key).slice('detected:'.length);
          const found = items.find((x) => String(x.id) === id);
          return Promise.resolve(found || null);
        }
        return Promise.resolve(null);
      });
    };

    it('applies status, flags, minImpact, search and default impact desc sorting', async () => {
      const items = [
        { id: '1', title: 'Alpha Doc', spaceKey: 'DOC', impactScore: 40, lastUpdated: '2024-01-01T00:00:00Z', status: 'detected', flags: { stale: true, inactive: false, orphaned: false, incomplete: false } },
        { id: '2', title: 'Beta Ops', spaceKey: 'OPS', impactScore: 80, lastUpdated: '2024-06-01T00:00:00Z', status: 'detected', flags: { stale: true, inactive: false, orphaned: false, incomplete: false } },
        { id: '3', title: 'Gamma', spaceKey: 'OPS', impactScore: 90, lastUpdated: '2024-05-01T00:00:00Z', status: 'archived', flags: { stale: false, inactive: true, orphaned: false, incomplete: false } },
      ];
      seedDetected(items);

      const { results, total } = await getDetectedPages({
        page: 1,
        pageSize: 10,
        filters: { status: 'detected', flags: ['stale'], minImpact: 50, search: 'ops' },
      });

      expect(total).toBe(1);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('sorts by updated with createdAt fallback and paginates asc', async () => {
      const items = [
        { id: '1', title: 'A', spaceKey: 'DOC', impactScore: 10, lastUpdated: '2024-01-01T00:00:00Z', createdAt: '2024-01-01T00:00:00Z', status: 'detected', flags: {} },
        { id: '2', title: 'B', spaceKey: 'OPS', impactScore: 20, lastUpdated: '2024-06-01T00:00:00Z', createdAt: '2024-06-01T00:00:00Z', status: 'detected', flags: {} },
        { id: '3', title: 'C', spaceKey: 'ENG', impactScore: 30, /* no lastUpdated */ createdAt: '2024-03-01T00:00:00Z', status: 'detected', flags: {} },
      ];
      seedDetected(items);

      const page1 = await getDetectedPages({ page: 1, pageSize: 1, sortBy: 'updated', sortDir: 'asc' });
      const page2 = await getDetectedPages({ page: 2, pageSize: 1, sortBy: 'updated', sortDir: 'asc' });

      // Order should be: id 1 (2024-01-01), id 3 (createdAt fallback 2024-03-01), id 2 (2024-06-01)
      expect(page1.results[0].id).toBe('1');
      expect(page2.results[0].id).toBe('3');
    });
  });
});
