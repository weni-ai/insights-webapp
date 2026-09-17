import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick, ref } from 'vue';

import AgentsCount from '../AgentsCount.vue';

const getAgentsCountByStatus = vi.fn();

vi.mock(
  '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/attendant',
  () => ({
    default: {
      getAgentsCountByStatus: (...args) => getAgentsCountByStatus(...args),
    },
  }),
);

const appliedFiltersRef = ref({
  sectors: [],
  queues: [],
  tags: [],
  channels: [],
});

const appliedDetailFiltersRef = ref({
  status: { value: [] },
});

const refreshDataMonitoringRef = ref(false);

const mockHumanSupportStore = {
  $id: 'humanSupport',
};

const mockMonitoringStore = {
  $id: 'humanSupportMonitoring',
};

vi.mock('@/store/modules/humanSupport/humanSupport', () => ({
  useHumanSupport: () => mockHumanSupportStore,
}));

vi.mock('@/store/modules/humanSupport/monitoring', () => ({
  useHumanSupportMonitoring: () => mockMonitoringStore,
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => {
      if (store?.$id === 'humanSupport') {
        return {
          appliedFilters: appliedFiltersRef,
          appliedDetailFilters: appliedDetailFiltersRef,
        };
      }
      if (store?.$id === 'humanSupportMonitoring') {
        return {
          refreshDataMonitoring: refreshDataMonitoringRef,
        };
      }
      return actual.storeToRefs(store);
    },
  };
});

const createWrapper = () =>
  mount(AgentsCount, {
    global: {
      plugins: [createTestingPinia()],
      stubs: {
        UnnnicSkeletonLoading: {
          name: 'UnnnicSkeletonLoading',
          template: '<div class="skeleton-stub" />',
        },
        UnnnicTag: {
          name: 'UnnnicTag',
          props: ['text', 'scheme'],
          template: '<span class="tag-stub">{{ text }}</span>',
        },
      },
    },
  });

describe('AgentsCount.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    appliedFiltersRef.value = {
      sectors: [],
      queues: [],
      tags: [],
      channels: [],
    };
    appliedDetailFiltersRef.value = {
      status: { value: [] },
    };
    refreshDataMonitoringRef.value = false;
    getAgentsCountByStatus.mockResolvedValue({
      online: 3,
      custom_breaks: 1,
      offline: 2,
    });
  });

  describe('initial load', () => {
    it('should load counts on mount', async () => {
      const wrapper = createWrapper();
      await nextTick();
      await Promise.resolve();

      expect(getAgentsCountByStatus).toHaveBeenCalled();
      await nextTick();

      expect(wrapper.vm.counts).toEqual({
        online: 3,
        custom_breaks: 1,
        offline: 2,
      });
      expect(wrapper.vm.isLoadingCounts).toBe(false);
    });

    it('should show skeletons while loading', async () => {
      let resolveRequest;
      getAgentsCountByStatus.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRequest = resolve;
          }),
      );

      const wrapper = createWrapper();
      await nextTick();

      expect(wrapper.findAll('.skeleton-stub').length).toBe(3);

      resolveRequest({ online: 1, custom_breaks: 0, offline: 0 });
      await Promise.resolve();
      await nextTick();

      expect(wrapper.findAll('.skeleton-stub').length).toBe(0);
    });

    it('should render tags after loading', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      const tags = wrapper.findAll('.tag-stub');
      expect(tags.length).toBe(3);
    });

    it('should handle API errors and clear loading', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      getAgentsCountByStatus.mockRejectedValue(new Error('network'));

      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.isLoadingCounts).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('status filter separation', () => {
    it('should split online/offline and custom statuses in the request', async () => {
      appliedDetailFiltersRef.value = {
        status: { value: ['online', 'lunch', 'offline'] },
      };

      createWrapper();
      await flushPromises();

      expect(getAgentsCountByStatus).toHaveBeenCalledWith({
        status: ['online', 'offline'],
        custom_status: ['lunch'],
      });
    });
  });

  describe('getActiveTags via status watcher', () => {
    it('should keep all tags when status filter is empty', async () => {
      const wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.activeTags).toEqual([
        'online',
        'custom_breaks',
        'offline',
      ]);
    });

    it('should update active tags when status filter changes', async () => {
      vi.useFakeTimers();
      const wrapper = createWrapper();
      await flushPromises();

      appliedDetailFiltersRef.value = {
        status: { value: ['online', 'coffee'] },
      };
      await nextTick();
      await vi.advanceTimersByTimeAsync(700);
      await flushPromises();

      expect(wrapper.vm.activeTags).toEqual(['online', 'custom_breaks']);
      expect(getAgentsCountByStatus).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('should include offline when selected', async () => {
      vi.useFakeTimers();
      const wrapper = createWrapper();
      await flushPromises();

      appliedDetailFiltersRef.value = {
        status: { value: ['offline'] },
      };
      await nextTick();
      await vi.advanceTimersByTimeAsync(700);
      await flushPromises();

      expect(wrapper.vm.activeTags).toEqual(['offline']);
      vi.useRealTimers();
    });
  });

  describe('filters and refresh watchers', () => {
    it('should reload when appliedFilters change', async () => {
      createWrapper();
      await flushPromises();
      getAgentsCountByStatus.mockClear();

      appliedFiltersRef.value = {
        ...appliedFiltersRef.value,
        sectors: [{ value: '1' }],
      };
      await flushPromises();

      expect(getAgentsCountByStatus).toHaveBeenCalled();
    });

    it('should reload when refreshDataMonitoring changes', async () => {
      createWrapper();
      await flushPromises();
      getAgentsCountByStatus.mockClear();

      refreshDataMonitoringRef.value = true;
      await flushPromises();

      expect(getAgentsCountByStatus).toHaveBeenCalled();
    });
  });
});

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
  await nextTick();
}
