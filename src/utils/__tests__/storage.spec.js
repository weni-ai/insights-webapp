import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModuleStorage, moduleStorage } from '../storage';

describe('ModuleStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('ModuleStorage class', () => {
    it('should create instance with default prefix', () => {
      const storage = new ModuleStorage();
      expect(storage.prefix).toBe('insights_');
    });

    it('should create instance with custom prefix', () => {
      const storage = new ModuleStorage('custom_');
      expect(storage.prefix).toBe('custom_');
    });

    it('should set and get string values', () => {
      const storage = new ModuleStorage('test_');
      storage.setItem('key1', 'value1');

      expect(localStorage.getItem('test_key1')).toBe('value1');
      expect(storage.getItem('key1')).toBe('value1');
    });

    it('should set and get object values', () => {
      const storage = new ModuleStorage('test_');
      const testObject = { name: 'test', value: 123 };

      storage.setItem('key1', testObject);
      expect(storage.getItem('key1')).toEqual(testObject);
    });

    it('should return default value when key does not exist', () => {
      const storage = new ModuleStorage('test_');
      expect(storage.getItem('nonexistent')).toBe(null);
      expect(storage.getItem('nonexistent', 'default')).toBe('default');
    });

    it('should remove items correctly', () => {
      const storage = new ModuleStorage('test_');
      storage.setItem('key1', 'value1');

      expect(storage.getItem('key1')).toBe('value1');
      storage.removeItem('key1');
      expect(storage.getItem('key1')).toBe(null);
    });

    it('should check if item exists', () => {
      const storage = new ModuleStorage('test_');
      expect(storage.hasItem('key1')).toBe(false);

      storage.setItem('key1', 'value1');
      expect(storage.hasItem('key1')).toBe(true);
    });

    it('should clear only items with module prefix', () => {
      const storage = new ModuleStorage('test_');

      // Set items with module prefix
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');

      // Set items without module prefix (simulating other modules)
      localStorage.setItem('other_key', 'other_value');
      localStorage.setItem('connect_key', 'connect_value');

      storage.clear();

      // Module items should be cleared
      expect(storage.getItem('key1')).toBe(null);
      expect(storage.getItem('key2')).toBe(null);

      // Other items should remain
      expect(localStorage.getItem('other_key')).toBe('other_value');
      expect(localStorage.getItem('connect_key')).toBe('connect_value');
    });

    it('should return keys with module prefix', () => {
      const storage = new ModuleStorage('test_');

      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      localStorage.setItem('other_key', 'other_value');

      const keys = storage.keys();
      expect(keys).toEqual(['key1', 'key2']);
    });

    it('should handle JSON parsing errors gracefully', () => {
      const storage = new ModuleStorage('test_');

      // Manually set invalid JSON
      localStorage.setItem('test_key1', '{invalid_json}');

      // Should return the raw string value
      expect(storage.getItem('key1')).toBe('{invalid_json}');
    });
  });

  describe('moduleStorage singleton', () => {
    it('should use insights_ prefix by default', () => {
      moduleStorage.setItem('test', 'value');
      expect(localStorage.getItem('insights_test')).toBe('value');
    });

    it('should be the same instance', () => {
      const storage1 = moduleStorage;
      const storage2 = moduleStorage;
      expect(storage1).toBe(storage2);
    });
  });

  describe('isolation between modules', () => {
    it('should isolate storage between different module prefixes', () => {
      const insightsStorage = new ModuleStorage('insights_');
      const connectStorage = new ModuleStorage('connect_');

      insightsStorage.setItem('token', 'insights-token');
      connectStorage.setItem('token', 'connect-token');

      expect(insightsStorage.getItem('token')).toBe('insights-token');
      expect(connectStorage.getItem('token')).toBe('connect-token');

      // Verify they don't interfere with each other
      insightsStorage.removeItem('token');
      expect(insightsStorage.getItem('token')).toBe(null);
      expect(connectStorage.getItem('token')).toBe('connect-token');
    });
  });
});
