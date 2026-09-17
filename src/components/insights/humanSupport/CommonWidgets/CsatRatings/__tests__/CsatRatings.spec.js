import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick, ref } from 'vue';

import CsatRatings from '../CsatRatings.vue';
import { LazyVisibilityKey } from '@/composables/useLazyData';
import {
  monitoringCsatTotalsMock,
  monitoringCsatAgentsMock,
  monitoringCsatRatingsMock,
} from '@/components/insights/humanSupport/Monitoring/mocks';
import {
  analysisCsatTotalsMock,
  analysisCsatAgentsMock,
  analysisCsatRatingsMock,
} from '@/components/insights/humanSupport/Analysis/mocks';

const getTotalsMonitoring = vi.fn();
const getTotalsAnalysis = vi.fn();
const getRatingsMonitoring = vi.fn();
const getRatingsAnalysis = vi.fn();
const checkEnableCsat = vi.fn();
const redirectToChatsConfig = vi.fn();

let infiniteScrollCallback = null;

vi.mock('@/services/api/resources/humanSupport/csat', () => ({
  default: {
    getTotalsMonitoring: (...args) => getTotalsMonitoring(...args),
    getTotalsAnalysis: (...args) => getTotalsAnalysis(...args),
    getRatingsMonitoring: (...args) => getRatingsMonitoring(...args),
    getRatingsAnalysis: (...args) => getRatingsAnalysis(...args),
  },
}));

vi.mock('@/utils/redirect', () => ({
  redirectToChatsConfig: (...args) => redirectToChatsConfig(...args),
}));

vi.mock('@vueuse/core', () => ({
  useInfiniteScroll: (_el, cb) => {
    infiniteScrollCallback = cb;
  },
  useMouseInElement: () => ({ isOutside: isOutsideRef }),
}));

const isOutsideRef = ref(false);
const hasSectorsConfiguredRef = ref(true);
const enableCsatRef = ref(true);
const appliedFiltersRef = ref({
  sectors: [],
  queues: [],
  tags: [],
  channels: [],
});
const appliedDateRangeRef = ref({ start: '', end: '' });
const widgetSetupPropsRef = ref({
  title: 'Setup',
  description: 'Configure sectors',
});
const refreshDataMonitoringRef = ref(false);

const mockConfigStore = {
  $id: 'config',
  get enableCsat() {
    return enableCsatRef.value;
  },
  checkEnableCsat: (...args) => checkEnableCsat(...args),
};

const mockProjectStore = {
  $id: 'project',
};

const mockHumanSupportStore = {
  $id: 'humanSupport',
};

const mockMonitoringStore = {
  $id: 'humanSupportMonitoring',
  get refreshDataMonitoring() {
    return refreshDataMonitoringRef.value;
  },
};

vi.mock('@/store/modules/config', () => ({
  useConfig: () => mockConfigStore,
}));

vi.mock('@/store/modules/project', () => ({
  useProject: () => mockProjectStore,
}));

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
      if (store?.$id === 'project') {
        return { hasSectorsConfigured: hasSectorsConfiguredRef };
      }
      if (store?.$id === 'humanSupport') {
        return {
          widgetSetupProps: widgetSetupPropsRef,
          appliedFilters: appliedFiltersRef,
          appliedDateRange: appliedDateRangeRef,
        };
      }
      return actual.storeToRefs(store);
    },
  };
});

const agentsResponse = {
  general: { rooms: 10, reviews: 8, avg_rating: 4.2 },
  next: null,
  results: [
    {
      agent: {
        name: 'Agent One',
        email: 'agent1@email.com',
        is_deleted: false,
      },
      rooms: 5,
      reviews: 4,
      avg_rating: 4.5,
    },
  ],
};

const ratingsResponse = {
  5: { value: 40, full_value: 4 },
  4: { value: 30, full_value: 3 },
  3: { value: 20, full_value: 2 },
  2: { value: 5, full_value: 1 },
  1: { value: 5, full_value: 1 },
};

const createWrapper = (props = {}, { hasBeenVisible = true } = {}) => {
  const hasBeenVisibleRef = ref(hasBeenVisible);
  const isVisibleRef = ref(hasBeenVisible);

  return mount(CsatRatings, {
    props: { type: 'monitoring', ...props },
    global: {
      plugins: [createTestingPinia()],
      provide: {
        [LazyVisibilityKey]: {
          hasBeenVisible: hasBeenVisibleRef,
          isVisible: isVisibleRef,
          forceLoad: vi.fn(),
        },
      },
      stubs: {
        BlurSetupWidget: {
          name: 'BlurSetupWidget',
          props: ['title', 'description', 'actionButtonProps', 'actionClick'],
          template:
            '<div class="blur-setup-stub" @click="actionClick && actionClick()" />',
        },
        AgentCard: {
          name: 'AgentCard',
          props: [
            'title',
            'subtitle',
            'tooltip',
            'rating',
            'active',
            'hiddenAvatar',
            'isDeleted',
            'deletedTooltip',
          ],
          emits: ['click'],
          template:
            '<button class="agent-card-stub" @click="$emit(\'click\')">{{ title }}</button>',
        },
        ProgressTable: {
          name: 'ProgressTable',
          props: ['progressItems', 'isLoading'],
          template: '<div class="progress-table-stub" />',
        },
        UnnnicSkeletonLoading: {
          name: 'UnnnicSkeletonLoading',
          template: '<div class="skeleton-stub" />',
        },
      },
    },
  });
};

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
  await nextTick();
}

describe('CsatRatings.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    infiniteScrollCallback = null;
    isOutsideRef.value = false;
    hasSectorsConfiguredRef.value = true;
    enableCsatRef.value = true;
    appliedFiltersRef.value = {
      sectors: [],
      queues: [],
      tags: [],
      channels: [],
    };
    appliedDateRangeRef.value = { start: '', end: '' };
    refreshDataMonitoringRef.value = false;

    checkEnableCsat.mockResolvedValue(undefined);
    getTotalsMonitoring.mockResolvedValue({ ...agentsResponse, next: null });
    getTotalsAnalysis.mockResolvedValue({ ...agentsResponse, next: null });
    getRatingsMonitoring.mockResolvedValue({ ...ratingsResponse });
    getRatingsAnalysis.mockResolvedValue({ ...ratingsResponse });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  describe('setup gates', () => {
    it('should show setup blur when sectors are not configured and mouse is inside', async () => {
      hasSectorsConfiguredRef.value = false;
      isOutsideRef.value = false;

      wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.find('.blur-setup-stub').exists()).toBe(true);
      expect(wrapper.vm.showSetup).toBe(true);
    });

    it('should show enable CSAT blur when sectors exist but CSAT is disabled', async () => {
      hasSectorsConfiguredRef.value = true;
      enableCsatRef.value = false;

      wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.showEnableCsat).toBe(true);
      expect(wrapper.find('.blur-setup-stub').exists()).toBe(true);
    });

    it('should call redirectToChatsConfig from enable CSAT action', async () => {
      hasSectorsConfiguredRef.value = true;
      enableCsatRef.value = false;

      wrapper = createWrapper();
      await flushPromises();

      await wrapper.find('.blur-setup-stub').trigger('click');
      expect(redirectToChatsConfig).toHaveBeenCalled();
    });
  });

  describe('mock data when sectors are not configured', () => {
    beforeEach(() => {
      hasSectorsConfiguredRef.value = false;
    });

    it('should use monitoring mocks for monitoring type', async () => {
      wrapper = createWrapper({ type: 'monitoring' });
      await flushPromises();

      expect(wrapper.vm.widgetGeneralTotals).toEqual(monitoringCsatTotalsMock);
      expect(wrapper.vm.widgetAgentsData).toEqual(monitoringCsatAgentsMock);
      expect(wrapper.vm.widgetRatingsData).toEqual(monitoringCsatRatingsMock);
    });

    it('should use analysis mocks for analysis type', async () => {
      wrapper = createWrapper({ type: 'analysis' });
      await flushPromises();

      expect(wrapper.vm.widgetGeneralTotals).toEqual(analysisCsatTotalsMock);
      expect(wrapper.vm.widgetAgentsData).toEqual(analysisCsatAgentsMock);
      expect(wrapper.vm.widgetRatingsData).toEqual(analysisCsatRatingsMock);
    });
  });

  describe('data loading when CSAT is enabled', () => {
    it('should load monitoring agents and ratings data', async () => {
      wrapper = createWrapper({ type: 'monitoring' });
      await flushPromises();

      expect(checkEnableCsat).toHaveBeenCalled();
      expect(getTotalsMonitoring).toHaveBeenCalled();
      expect(getRatingsMonitoring).toHaveBeenCalled();
      expect(wrapper.vm.agentsGeneralTotals).toEqual(agentsResponse.general);
      expect(wrapper.vm.agentsData).toEqual(agentsResponse.results);
      expect(wrapper.vm.ratingsData).toEqual(ratingsResponse);
      expect(wrapper.vm.isLoadingAgentsData).toBe(false);
      expect(wrapper.vm.isLoadingRatingsData).toBe(false);
    });

    it('should load analysis endpoints when type is analysis', async () => {
      wrapper = createWrapper({ type: 'analysis' });
      await flushPromises();

      expect(getTotalsAnalysis).toHaveBeenCalled();
      expect(getRatingsAnalysis).toHaveBeenCalled();
      expect(getTotalsMonitoring).not.toHaveBeenCalled();
    });

    it('should not load agents/ratings when CSAT is disabled', async () => {
      enableCsatRef.value = false;

      wrapper = createWrapper();
      await flushPromises();

      expect(getTotalsMonitoring).not.toHaveBeenCalled();
      expect(getRatingsMonitoring).not.toHaveBeenCalled();
      expect(wrapper.vm.isLoadingAgentsData).toBe(false);
      expect(wrapper.vm.isLoadingRatingsData).toBe(false);
    });

    it('should handle agents load errors and clear loading', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      getTotalsMonitoring.mockRejectedValue(new Error('agents failed'));

      wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.isLoadingAgentsData).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle ratings load errors and clear loading', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      getRatingsMonitoring.mockRejectedValue(new Error('ratings failed'));

      wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.isLoadingRatingsData).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should concat agent results when concat is true', async () => {
      getTotalsMonitoring
        .mockResolvedValueOnce({
          ...agentsResponse,
          next: 'https://api.example.com/?cursor=abc',
        })
        .mockResolvedValueOnce({
          general: agentsResponse.general,
          next: null,
          results: [
            {
              agent: {
                name: 'Agent Two',
                email: 'agent2@email.com',
                is_deleted: false,
              },
              rooms: 2,
              reviews: 2,
              avg_rating: 4.0,
            },
          ],
        });

      wrapper = createWrapper();
      await flushPromises();

      expect(wrapper.vm.agentsTotalNext).toBe('abc');

      await wrapper.vm.loadAgentsData({ silent: true, concat: true });
      await flushPromises();

      expect(wrapper.vm.agentsData).toHaveLength(2);
      expect(wrapper.vm.agentsData[1].agent.email).toBe('agent2@email.com');
    });
  });

  describe('progress items', () => {
    it('should build progress items in reverse rating order', async () => {
      wrapper = createWrapper();
      await flushPromises();

      const items = wrapper.vm.progressItemsRatingsData;
      expect(items).toHaveLength(5);
      expect(items[0].value).toBe(ratingsResponse['5'].value);
      expect(items[4].value).toBe(ratingsResponse['1'].value);
      expect(items[0].description).toContain('(');
    });
  });

  describe('agent selection', () => {
    it('should reload ratings when an agent is selected', async () => {
      wrapper = createWrapper();
      await flushPromises();
      getRatingsMonitoring.mockClear();

      wrapper.vm.activeAgentEmail = 'agent1@email.com';
      await flushPromises();

      expect(getRatingsMonitoring).toHaveBeenCalledWith({
        agent_email: 'agent1@email.com',
      });
    });
  });

  describe('infinite scroll', () => {
    it('should load more agents when next cursor exists', async () => {
      getTotalsMonitoring.mockResolvedValue({
        ...agentsResponse,
        next: 'https://api.example.com/?cursor=page2',
      });

      wrapper = createWrapper();
      await flushPromises();
      getTotalsMonitoring.mockClear();

      expect(infiniteScrollCallback).toBeTypeOf('function');
      await infiniteScrollCallback();
      await flushPromises();

      expect(getTotalsMonitoring).toHaveBeenCalledWith({
        cursor: 'page2',
      });
      expect(wrapper.vm.agentsData.length).toBeGreaterThan(0);
    });

    it('should not load more agents when there is no next cursor', async () => {
      wrapper = createWrapper();
      await flushPromises();
      getTotalsMonitoring.mockClear();

      await infiniteScrollCallback();
      await flushPromises();

      expect(getTotalsMonitoring).not.toHaveBeenCalled();
    });
  });

  describe('watchers', () => {
    it('should reload data when filters change after becoming visible', async () => {
      wrapper = createWrapper();
      await flushPromises();
      getTotalsMonitoring.mockClear();
      getRatingsMonitoring.mockClear();

      appliedFiltersRef.value = {
        ...appliedFiltersRef.value,
        sectors: [{ value: '1' }],
      };
      await flushPromises();

      expect(getTotalsMonitoring).toHaveBeenCalled();
      expect(wrapper.vm.activeAgentEmail).toBeNull();
    });

    it('should not reload when widget has never been visible', async () => {
      wrapper = createWrapper({}, { hasBeenVisible: false });
      await flushPromises();
      getTotalsMonitoring.mockClear();

      appliedFiltersRef.value = {
        ...appliedFiltersRef.value,
        sectors: [{ value: '2' }],
      };
      await flushPromises();

      expect(getTotalsMonitoring).not.toHaveBeenCalled();
    });

    it('should reload on refreshDataMonitoring when visible and CSAT enabled', async () => {
      wrapper = createWrapper();
      await flushPromises();
      getTotalsMonitoring.mockClear();
      getRatingsMonitoring.mockClear();

      refreshDataMonitoringRef.value = true;
      await flushPromises();

      expect(getTotalsMonitoring).toHaveBeenCalled();
    });
  });
});
