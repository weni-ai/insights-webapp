import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHumanSupport } from '../humanSupport';
import { useHumanSupportMonitoring } from '../monitoring';
import { useHumanSupportAnalysis } from '../analysis';

vi.mock('../monitoring', () => ({
  useHumanSupportMonitoring: vi.fn(),
}));

vi.mock('../analysis', () => ({
  useHumanSupportAnalysis: vi.fn(),
}));

vi.mock('@/utils/time', () => ({
  getLastNDays: vi.fn(() => ({
    start: '2024-01-01',
    end: '2024-01-07',
    dmFormat: '01/01 - 07/01',
  })),
}));

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    currentRoute: {
      value: {
        query: {},
      },
    },
  })),
}));

describe('useHumanSupport store', () => {
  let store;
  let mockLoadAllDataMonitoring;
  let mockLoadAllDataAnalysis;

  beforeEach(() => {
    mockLoadAllDataMonitoring = vi.fn();
    mockLoadAllDataAnalysis = vi.fn();

    useHumanSupportMonitoring.mockReturnValue({
      loadAllData: mockLoadAllDataMonitoring,
    });

    useHumanSupportAnalysis.mockReturnValue({
      loadAllData: mockLoadAllDataAnalysis,
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

    it('should initialize applied detail filters', () => {
      expect(store.appliedDetailFilters).toEqual({
        agent: { value: '', label: '' },
        contact: { value: '', label: '' },
        ticketId: { value: '', label: '' },
      });
    });

    it('should initialize applied date range with last 7 days', () => {
      expect(store.appliedDateRange).toEqual({
        start: '2024-01-01',
        end: '2024-01-07',
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

  describe('detail filter management', () => {
    describe('saveAppliedDetailFilter', () => {
      it('should save applied agent filter with value and label', () => {
        store.saveAppliedDetailFilter('agent', 'agent-123', 'Agent Name');

        expect(store.appliedDetailFilters.agent.value).toBe('agent-123');
        expect(store.appliedDetailFilters.agent.label).toBe('Agent Name');
      });

      it('should save applied contact filter with value and label', () => {
        store.saveAppliedDetailFilter('contact', 'contact-456', 'Contact Name');

        expect(store.appliedDetailFilters.contact.value).toBe('contact-456');
        expect(store.appliedDetailFilters.contact.label).toBe('Contact Name');
      });

      it('should save applied ticketId filter with value and label', () => {
        store.saveAppliedDetailFilter('ticketId', 'ticket-789', 'Ticket 789');

        expect(store.appliedDetailFilters.ticketId.value).toBe('ticket-789');
        expect(store.appliedDetailFilters.ticketId.label).toBe('Ticket 789');
      });

      it('should update existing applied detail filter', () => {
        store.saveAppliedDetailFilter('agent', 'agent-123', 'Agent Name');
        store.saveAppliedDetailFilter('agent', 'agent-456', 'Another Agent');

        expect(store.appliedDetailFilters.agent.value).toBe('agent-456');
        expect(store.appliedDetailFilters.agent.label).toBe('Another Agent');
      });

      it('should save empty detail filter', () => {
        store.saveAppliedDetailFilter('agent', 'agent-123', 'Agent Name');
        store.saveAppliedDetailFilter('agent', '', '');

        expect(store.appliedDetailFilters.agent.value).toBe('');
        expect(store.appliedDetailFilters.agent.label).toBe('');
      });

      it('should handle multiple detail filter types independently', () => {
        store.saveAppliedDetailFilter('agent', 'agent-123', 'Agent Name');
        store.saveAppliedDetailFilter('contact', 'contact-456', 'Contact Name');
        store.saveAppliedDetailFilter('ticketId', 'ticket-789', 'Ticket 789');

        expect(store.appliedDetailFilters.agent.value).toBe('agent-123');
        expect(store.appliedDetailFilters.contact.value).toBe('contact-456');
        expect(store.appliedDetailFilters.ticketId.value).toBe('ticket-789');
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
    it('should call loadAllDataMonitoring when appliedFilters changes and tab is monitoring', async () => {
      vi.clearAllMocks();
      store.setActiveTab('monitoring');

      store.appliedFilters = {
        sectors: [{ value: 'sector1', label: 'Sector 1' }],
        queues: [],
        tags: [],
      };

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLoadAllDataMonitoring).toHaveBeenCalled();
      expect(mockLoadAllDataAnalysis).not.toHaveBeenCalled();
    });

    it('should call loadAllDataAnalysis when appliedFilters changes and tab is analysis', async () => {
      vi.clearAllMocks();
      store.setActiveTab('analysis');

      store.appliedFilters = {
        sectors: [{ value: 'sector1', label: 'Sector 1' }],
        queues: [],
        tags: [],
      };

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLoadAllDataAnalysis).toHaveBeenCalled();
      expect(mockLoadAllDataMonitoring).not.toHaveBeenCalled();
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

  describe('applied date range watcher', () => {
    it('should call loadAllDataAnalysis when appliedDateRange changes and tab is analysis', async () => {
      vi.clearAllMocks();
      store.setActiveTab('analysis');

      store.appliedDateRange = {
        start: '2024-01-15',
        end: '2024-01-22',
      };

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLoadAllDataAnalysis).toHaveBeenCalled();
    });

    it('should not call loadAllDataMonitoring when appliedDateRange changes and tab is monitoring', async () => {
      vi.clearAllMocks();
      store.setActiveTab('monitoring');

      store.appliedDateRange = {
        start: '2024-01-15',
        end: '2024-01-22',
      };

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLoadAllDataMonitoring).not.toHaveBeenCalled();
    });

    it('should not call any load function when appliedDateRange changes and tab is monitoring', async () => {
      vi.clearAllMocks();
      store.setActiveTab('monitoring');

      store.appliedDateRange = {
        start: '2024-02-01',
        end: '2024-02-07',
      };

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockLoadAllDataMonitoring).not.toHaveBeenCalled();
      expect(mockLoadAllDataAnalysis).not.toHaveBeenCalled();
    });
  });
});
