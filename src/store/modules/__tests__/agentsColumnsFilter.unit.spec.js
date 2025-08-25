import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAgentsColumnsFilter } from '../agentsColumnsFilter';
import { useConfig } from '../config';
import { moduleStorage } from '@/utils/storage';

vi.mock('../config', () => ({
  useConfig: vi.fn(),
}));

const mockProjectUuid = 'test-project-uuid';

describe('useAgentsColumnsFilter Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());

    useConfig.mockReturnValue({
      project: { uuid: mockProjectUuid },
    });

    store = useAgentsColumnsFilter();

    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('setVisibleColumns', () => {
    it('should set visible columns excluding static ones', () => {
      store.setVisibleColumns(['name', 'email', 'status', 'agent']);
      expect(store.visibleColumns).toEqual(['name', 'email']);
    });

    it('should save to moduleStorage', () => {
      store.setVisibleColumns(['email']);
      const key = `${store.getStorageKey}`;
      expect(moduleStorage.getItem(key)).toEqual(['email']);
    });

    it('should ignore non-array input', () => {
      store.setVisibleColumns(null);
      expect(store.visibleColumns).toEqual([]);
    });

    it('should remove duplicates and invalid types', () => {
      store.setVisibleColumns(['name', 'name', 123, 'agent']);
      expect(store.visibleColumns).toEqual(['name']);
    });
  });

  describe('clearVisibleColumns', () => {
    it('should clear visible columns and remove from moduleStorage', () => {
      store.setVisibleColumns(['name']);
      store.clearVisibleColumns();
      expect(store.visibleColumns).toEqual([]);
      expect(moduleStorage.getItem(store.getStorageKey)).toBeNull();
    });
  });

  describe('toggleColumn', () => {
    it('should add column if not present', () => {
      store.toggleColumn('name');
      expect(store.visibleColumns).toContain('name');
    });

    it('should remove column if already present', () => {
      store.setVisibleColumns(['name']);
      store.toggleColumn('name');
      expect(store.visibleColumns).not.toContain('name');
    });

    it('should not toggle static columns', () => {
      store.toggleColumn('status');
      expect(store.visibleColumns).not.toContain('status');
    });

    it('should save updated columns to moduleStorage', () => {
      store.toggleColumn('email');
      expect(moduleStorage.getItem(store.getStorageKey)).toEqual(['email']);
    });
  });

  describe('initializeFromStorage', () => {
    it('should load valid columns from moduleStorage', () => {
      moduleStorage.setItem(store.getStorageKey, ['name', 'agent']);
      store.initializeFromStorage();
      expect(store.visibleColumns).toEqual(['name']);
      expect(store.hasInitialized).toBe(true);
    });

    it('should handle non-array data', () => {
      moduleStorage.setItem(store.getStorageKey, 'invalid_data');
      store.initializeFromStorage();
      expect(store.visibleColumns).toEqual([]);
      expect(store.hasInitialized).toBe(true);
    });

    it('should handle missing data', () => {
      store.initializeFromStorage();
      expect(store.visibleColumns).toEqual([]);
      expect(store.hasInitialized).toBe(true);
    });
  });

  describe('updateLastAppliedFilters', () => {
    it('should update last applied filters', () => {
      const filters = { name: 'test' };
      store.updateLastAppliedFilters(filters);
      expect(store.lastAppliedFilters).toEqual(filters);
    });
  });

  describe('setInitialized', () => {
    it('should set initialization flag', () => {
      store.setInitialized(true);
      expect(store.hasInitialized).toBe(true);
    });
  });

  describe('getters', () => {
    it('should return true for hasVisibleColumns when columns exist', () => {
      store.setVisibleColumns(['name']);
      expect(store.hasVisibleColumns).toBe(true);
    });

    it('should return only dynamic columns', () => {
      store.setVisibleColumns(['name', 'email']);
      expect(store.dynamicColumns).toEqual(['name', 'email']);
    });

    it('should return all visible columns including static ones', () => {
      store.setVisibleColumns(['name']);
      expect(store.allVisibleColumns).toEqual(['status', 'agent', 'name']);
    });

    it('should return correct storage key from config', () => {
      expect(store.getStorageKey).toBe(
        `${store.$id}_${mockProjectUuid}`.replace(
          'agentsColumnsFilter_',
          'agents_columns_filter_',
        ),
      );
    });
  });
});
