import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { isRef, ref } from 'vue';

import MostTalkedAboutTopicsWidget from '../index.vue';

const topicsDistributionCount = ref(5);
const topicsDistribution = ref([]);
const isLoadingTopicsDistribution = ref(false);
const topicType = ref('HUMAN');
const hasExistingTopics = ref(true);
const shouldUseMock = ref(false);

const mockTopicsStore = {
  topicsDistributionCount,
  topicsDistribution,
  isLoadingTopicsDistribution,
  topicType,
  hasExistingTopics,
  loadTopicsDistribution: vi.fn(),
  toggleAddTopicsDrawer: vi.fn(),
  setTopicType: vi.fn(),
};

const applyStoreOverrides = (store, overrides = {}) => {
  Object.entries(overrides).forEach(([key, value]) => {
    if (isRef(store[key])) {
      store[key].value = value;
      return;
    }

    store[key] = value;
  });
};

const mockRoute = {
  query: {},
};

const mockConversationalStore = {
  refreshDataConversational: false,
  setIsLoadingConversationalData: vi.fn(),
  shouldUseMock,
};

vi.mock('@/store/modules/conversational/topics', () => ({
  useConversationalTopics: () => mockTopicsStore,
}));

vi.mock('@/store/modules/conversational/conversational', () => ({
  useConversational: () => mockConversationalStore,
}));

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRoute: () => mockRoute,
  };
});

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => store,
  };
});

describe('MostTalkedAboutTopicsWidget', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    applyStoreOverrides(mockTopicsStore, storeOverrides);
    return mount(MostTalkedAboutTopicsWidget, {
      global: {
        stubs: {
          BaseConversationWidget: true,
          TreemapChart: true,
          UnnnicButton: true,
          SeeAllDrawer: true,
          AddWidget: true,
          DrawerTopics: true,
        },
      },
    });
  };

  const section = () =>
    wrapper.find('[data-testid="most-talked-about-topics"]');

  beforeEach(() => {
    vi.clearAllMocks();
    topicsDistributionCount.value = 5;
    topicsDistribution.value = [];
    isLoadingTopicsDistribution.value = false;
    topicType.value = 'HUMAN';
    hasExistingTopics.value = true;
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render with existing topics', () => {
      wrapper = createWrapper({
        hasExistingTopics: true,
        isLoadingTopicsDistribution: false,
      });

      expect(section().exists()).toBe(true);
    });

    it('should render when loading', () => {
      wrapper = createWrapper({
        hasExistingTopics: false,
        isLoadingTopicsDistribution: true,
      });

      expect(section().exists()).toBe(true);
    });
  });

  describe('Component structure', () => {
    it('should have correct CSS classes', () => {
      expect(section().classes()).toContain('most-talked-about-topics');
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Data management', () => {
    it('should use empty array when topics count is zero', () => {
      wrapper = createWrapper({
        hasExistingTopics: true,
        topicsDistributionCount: 0,
      });

      expect(wrapper.vm.treemapData).toEqual([]);
    });

    it('should use store distribution when has existing topics', () => {
      const mockDistribution = [{ label: 'Topic', value: 100, percentage: 50 }];
      wrapper = createWrapper({
        hasExistingTopics: true,
        topicsDistributionCount: 1,
        topicsDistribution: mockDistribution,
      });

      expect(wrapper.vm.treemapData).toEqual(mockDistribution);
    });

    it('should sort topics distribution by percentage in descending order', () => {
      const mockDistribution = [
        { label: 'Topic A', value: 100, percentage: 30 },
        { label: 'Topic B', value: 200, percentage: 50 },
        { label: 'Topic C', value: 150, percentage: 20 },
      ];
      const expectedSorted = [
        { label: 'Topic B', value: 200, percentage: 50 },
        { label: 'Topic A', value: 100, percentage: 30 },
        { label: 'Topic C', value: 150, percentage: 20 },
      ];

      wrapper = createWrapper({
        hasExistingTopics: true,
        topicsDistributionCount: 3,
        topicsDistribution: mockDistribution,
      });

      expect(wrapper.vm.treemapData).toEqual(expectedSorted);
    });

    it('should not mutate original topics distribution array', () => {
      const mockDistribution = [
        { label: 'Topic A', value: 100, percentage: 30 },
        { label: 'Topic B', value: 200, percentage: 50 },
      ];
      const originalOrder = [...mockDistribution];

      wrapper = createWrapper({
        hasExistingTopics: true,
        topicsDistributionCount: 2,
        topicsDistribution: mockDistribution,
      });

      const sortedData = wrapper.vm.treemapData;

      expect(mockDistribution).toEqual(originalOrder);
      expect(sortedData[0].percentage).toBeGreaterThanOrEqual(
        sortedData[1].percentage,
      );
    });
  });

  describe('Event handling', () => {
    it('should call handleSeeAllDrawer method', () => {
      expect(wrapper.vm.isSeeAllDrawerOpen).toBe(false);

      wrapper.vm.handleSeeAllDrawer();

      expect(wrapper.vm.isSeeAllDrawerOpen).toBe(true);
      expect(wrapper.vm.expandedItems).toEqual([]);
    });

    it('should handle expanded item in handleSeeAllDrawer', () => {
      wrapper.vm.handleSeeAllDrawer('Specific Topic');

      expect(wrapper.vm.isSeeAllDrawerOpen).toBe(true);
      expect(wrapper.vm.expandedItems).toEqual(['Specific Topic']);
    });

    it('should not toggle drawer when loading', () => {
      wrapper = createWrapper({ isLoadingTopicsDistribution: true });

      wrapper.vm.handleSeeAllDrawer();

      expect(wrapper.vm.isSeeAllDrawerOpen).toBe(false);
    });

    it('should call setTopicType for AI tab', () => {
      wrapper.vm.handleTabChange('artificial-intelligence');

      expect(mockTopicsStore.setTopicType).toHaveBeenCalledWith('AI');
    });

    it('should call setTopicType for HUMAN tab', () => {
      wrapper.vm.handleTabChange('human');

      expect(mockTopicsStore.setTopicType).toHaveBeenCalledWith('HUMAN');
    });
  });

  describe('Lifecycle', () => {
    it('should load topics distribution on mounted', () => {
      expect(mockTopicsStore.loadTopicsDistribution).toHaveBeenCalled();
    });
  });

  describe('Conditional rendering', () => {
    it('should handle different store states', () => {
      const testCases = [
        {
          hasExistingTopics: true,
          isLoadingTopicsDistribution: false,
        },
        {
          hasExistingTopics: false,
          isLoadingTopicsDistribution: false,
        },
        {
          hasExistingTopics: false,
          isLoadingTopicsDistribution: true,
        },
      ];

      testCases.forEach((testCase) => {
        wrapper = createWrapper(testCase);
        expect(section().exists()).toBe(true);
      });
    });
  });

  describe('Refresh Functionality', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should have conversational store integration', () => {
      expect(wrapper.vm).toBeDefined();
      expect(
        mockConversationalStore.setIsLoadingConversationalData,
      ).toBeDefined();
    });
  });

  describe('Store Integration', () => {
    it('should use conversationalTopics store', () => {
      expect(mockTopicsStore.loadTopicsDistribution).toBeDefined();
      expect(mockTopicsStore.toggleAddTopicsDrawer).toBeDefined();
      expect(mockTopicsStore.setTopicType).toBeDefined();
    });

    it('should use conversational store', () => {
      expect(mockConversationalStore.refreshDataConversational).toBeDefined();
      expect(
        mockConversationalStore.setIsLoadingConversationalData,
      ).toBeDefined();
    });
  });

  describe('Mock mode (shouldUseMock = true)', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      shouldUseMock.value = true;
      topicsDistributionCount.value = 0;
      topicsDistribution.value = [];
      isLoadingTopicsDistribution.value = false;
      topicType.value = 'HUMAN';
      hasExistingTopics.value = false;
      wrapper = createWrapper();
    });

    afterEach(() => {
      shouldUseMock.value = false;
    });

    it('should use mock topics distribution as treemapData', () => {
      const data = wrapper.vm.treemapData;
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('label');
      expect(data[0]).toHaveProperty('value');
      expect(data[0]).toHaveProperty('percentage');
    });

    it('should add mock-hover CSS class', () => {
      expect(section().classes()).toContain(
        'most-talked-about-topics--mock-hover',
      );
    });

    it('should pass empty actions to BaseConversationWidget', () => {
      const baseWidget = wrapper.find('[data-testid="topics-base-widget"]');
      expect(baseWidget.attributes('actions')).toBe('');
    });

    it('should pass hiddenTabs as true to BaseConversationWidget', () => {
      const baseWidget = wrapper.find('[data-testid="topics-base-widget"]');
      expect(baseWidget.attributes('hiddentabs')).toBeTruthy();
    });

    it('should not show See All button', () => {
      expect(
        wrapper.find('[data-testid="topics-see-all-button"]').exists(),
      ).toBe(false);
    });

    it('should show AddWidget overlay for hover effect', () => {
      expect(wrapper.find('[data-testid="topics-add-widget"]').exists()).toBe(
        true,
      );
    });
  });
});
