import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHumanSupport } from '../humanSupport';
import { useHumanSupportMonitoring } from '../monitoring';

vi.mock('../monitoring', () => ({
  useHumanSupportMonitoring: vi.fn(),
}));

describe('useHumanSupport store', () => {
  let store;
  let mockLoadAllDataMonitoring;

  beforeEach(() => {
    mockLoadAllDataMonitoring = vi.fn();

    useHumanSupportMonitoring.mockReturnValue({
      loadAllData: mockLoadAllDataMonitoring,
    });

    setActivePinia(createPinia());
    store = useHumanSupport();
  });

  describe('initial state', () => {
    it('should initialize with empty filter arrays', () => {
      expect(store.sectors).toEqual([]);
      expect(store.queues).toEqual([]);
      expect(store.tags).toEqual([]);
    });

    it('should initialize active tab as monitoring', () => {
      expect(store.activeTab).toBe('monitoring');
    });

    it('should initialize applied filters with empty arrays', () => {
      expect(store.appliedFilters).toEqual({
        sectors: [],
        queues: [],
        tags: [],
      });
    });

    it('should initialize applied agent filter', () => {
      expect(store.appliedAgentFilter).toEqual({
        value: '',
        label: '',
      });
    });

    it('should initialize applied date range with empty strings', () => {
      expect(store.appliedDateRange).toEqual({
        start: '',
        end: '',
      });
    });

    it('should initialize appliedFiltersLength to 0', () => {
      expect(store.appliedFiltersLength).toBe(0);
    });
  });

  describe('filter management', () => {
    beforeEach(() => {
      store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
      store.queues = [{ value: 'queue1', label: 'Queue 1' }];
      store.tags = [{ value: 'tag1', label: 'Tag 1' }];
    });

    describe('saveAppliedFilters', () => {
      it('should save current filter values to appliedFilters', () => {
        store.saveAppliedFilters();

        expect(store.appliedFiltersLength).toBe(3);
      });

      it('should update appliedFiltersLength based on saved filters', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.queues = [];
        store.tags = [];

        store.saveAppliedFilters();

        expect(store.appliedFiltersLength).toBe(1);
      });

      it('should create a copy of filter arrays', () => {
        store.saveAppliedFilters();

        expect(store.appliedFilters.sectors).toEqual(store.sectors);
        expect(store.appliedFilters.sectors).not.toBe(store.sectors);
      });
    });

    describe('clearFilters', () => {
      it('should clear all filter arrays', () => {
        store.clearFilters();

        expect(store.sectors).toEqual([]);
        expect(store.queues).toEqual([]);
        expect(store.tags).toEqual([]);
      });

      it('should reset appliedFiltersLength to 0', () => {
        store.saveAppliedFilters();
        expect(store.appliedFiltersLength).toBe(3);

        store.clearFilters();
        expect(store.appliedFiltersLength).toBe(0);
      });

      it('should clear applied filters', () => {
        store.saveAppliedFilters();

        store.clearFilters();

        expect(store.appliedFilters).toEqual({
          sectors: [],
          queues: [],
          tags: [],
        });
      });
    });

    describe('appliedFiltersLength computed', () => {
      it('should return 0 when no filters are applied', () => {
        store.clearFilters();
        expect(store.appliedFiltersLength).toBe(0);
      });

      it('should count each filter type as 1 when applied', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.queues = [
          { value: 'queue1', label: 'Queue 1' },
          { value: 'queue2', label: 'Queue 2' },
        ];
        store.tags = [];

        store.saveAppliedFilters();

        expect(store.appliedFiltersLength).toBe(2);
      });

      it('should count all three filter types when all are applied', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.queues = [{ value: 'queue1', label: 'Queue 1' }];
        store.tags = [{ value: 'tag1', label: 'Tag 1' }];

        store.saveAppliedFilters();

        expect(store.appliedFiltersLength).toBe(3);
      });
    });

    describe('hasAppliedFiltersNoChanges computed', () => {
      beforeEach(() => {
        store.clearFilters();
      });

      it('should return true when no filters are set and none applied', () => {
        expect(store.hasAppliedFiltersNoChanges).toBe(true);
      });

      it('should return false when current filters differ from applied', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });

      it('should return true when current filters match applied filters', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.queues = [{ value: 'queue1', label: 'Queue 1' }];

        store.saveAppliedFilters();

        expect(store.hasAppliedFiltersNoChanges).toBe(true);
      });

      it('should return false when arrays have different lengths', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.saveAppliedFilters();

        store.sectors = [
          { value: 'sector1', label: 'Sector 1' },
          { value: 'sector2', label: 'Sector 2' },
        ];

        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });

      it('should return true when arrays have same items in different order', () => {
        store.sectors = [
          { value: 'sector1', label: 'Sector 1' },
          { value: 'sector2', label: 'Sector 2' },
        ];
        store.saveAppliedFilters();

        store.sectors = [
          { value: 'sector2', label: 'Sector 2' },
          { value: 'sector1', label: 'Sector 1' },
        ];

        expect(store.hasAppliedFiltersNoChanges).toBe(true);
      });

      it('should return false when arrays have different values', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.saveAppliedFilters();

        store.sectors = [{ value: 'sector2', label: 'Sector 2' }];

        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });

      it('should handle complex filter combinations correctly', () => {
        store.sectors = [
          { value: 'sector1', label: 'Sector 1' },
          { value: 'sector2', label: 'Sector 2' },
        ];
        store.queues = [{ value: 'queue1', label: 'Queue 1' }];
        store.tags = [
          { value: 'tag1', label: 'Tag 1' },
          { value: 'tag2', label: 'Tag 2' },
        ];

        store.saveAppliedFilters();
        expect(store.hasAppliedFiltersNoChanges).toBe(true);

        store.tags = [{ value: 'tag1', label: 'Tag 1' }];
        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });

      it('should handle edge case with empty applied filters', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.saveAppliedFilters();

        store.sectors = [];
        expect(store.hasAppliedFiltersNoChanges).toBe(false);
      });
    });

    describe('clearFilters optimization', () => {
      it('should handle clearing when all filters are already empty', () => {
        store.clearFilters();

        expect(store.sectors).toEqual([]);
        expect(store.queues).toEqual([]);
        expect(store.tags).toEqual([]);
        expect(store.appliedFiltersLength).toBe(0);

        expect(() => store.clearFilters()).not.toThrow();

        expect(store.sectors).toEqual([]);
        expect(store.queues).toEqual([]);
        expect(store.tags).toEqual([]);
        expect(store.appliedFiltersLength).toBe(0);
      });

      it('should clear filters when there are current filters but no applied ones', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];

        store.clearFilters();

        expect(store.sectors).toEqual([]);
        expect(store.appliedFiltersLength).toBe(0);
      });

      it('should clear filters when there are applied filters but no current ones', () => {
        store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
        store.saveAppliedFilters();
        store.sectors = [];

        store.clearFilters();

        expect(store.appliedFiltersLength).toBe(0);
      });
    });
  });

  describe('agent filter management', () => {
    describe('saveAppliedAgentFilter', () => {
      it('should save applied agent filter with value and label', () => {
        store.saveAppliedAgentFilter('agent-123', 'Agent Name');

        expect(store.appliedAgentFilter.value).toBe('agent-123');
        expect(store.appliedAgentFilter.label).toBe('Agent Name');
      });

      it('should update existing applied agent filter', () => {
        store.saveAppliedAgentFilter('agent-123', 'Agent Name');
        store.saveAppliedAgentFilter('agent-456', 'Another Agent');

        expect(store.appliedAgentFilter.value).toBe('agent-456');
        expect(store.appliedAgentFilter.label).toBe('Another Agent');
      });

      it('should save empty agent filter', () => {
        store.saveAppliedAgentFilter('agent-123', 'Agent Name');
        store.saveAppliedAgentFilter('', '');

        expect(store.appliedAgentFilter.value).toBe('');
        expect(store.appliedAgentFilter.label).toBe('');
      });
    });
  });

  describe('active tab management', () => {
    it('should set active tab to monitoring', () => {
      store.setActiveTab('monitoring');
      expect(store.activeTab).toBe('monitoring');
    });

    it('should set active tab to analysis', () => {
      store.setActiveTab('analysis');
      expect(store.activeTab).toBe('analysis');
    });

    it('should switch between tabs correctly', () => {
      expect(store.activeTab).toBe('monitoring');

      store.setActiveTab('analysis');
      expect(store.activeTab).toBe('analysis');

      store.setActiveTab('monitoring');
      expect(store.activeTab).toBe('monitoring');
    });

    it('should maintain tab state after multiple changes', () => {
      store.setActiveTab('analysis');
      store.setActiveTab('monitoring');
      store.setActiveTab('analysis');

      expect(store.activeTab).toBe('analysis');
    });
  });

  describe('applied filters watcher', () => {
    it('should call loadAllDataMonitoring when appliedFilters changes', async () => {
      vi.clearAllMocks();

      store.appliedFilters = {
        sectors: [{ value: 'sector1', label: 'Sector 1' }],
        queues: [],
        tags: [],
      };

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLoadAllDataMonitoring).toHaveBeenCalled();
    });

    it('should call loadAllDataMonitoring when saveAppliedFilters is called', async () => {
      vi.clearAllMocks();

      store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
      store.saveAppliedFilters();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLoadAllDataMonitoring).toHaveBeenCalled();
    });

    it('should call loadAllDataMonitoring when clearFilters is called', async () => {
      vi.clearAllMocks();

      store.sectors = [{ value: 'sector1', label: 'Sector 1' }];
      store.clearFilters();

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLoadAllDataMonitoring).toHaveBeenCalled();
    });
  });
});
