import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import MostTalkedAboutTopicsWidget from '../index.vue';

const mockTopicsStore = {
  topicsDistributionCount: { value: 5 },
  topicsDistribution: { value: [] },
  isLoadingTopicsDistribution: { value: false },
  topicType: { value: 'HUMAN' },
  hasExistingTopics: { value: true },
  loadTopicsDistribution: vi.fn(),
  toggleAddTopicsDrawer: vi.fn(),
  setTopicType: vi.fn(),
};

const mockRoute = {
  query: {},
};

vi.mock('@/store/modules/conversational/topics', () => ({
  useConversationalTopics: () => mockTopicsStore,
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

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      conversations_dashboard: {
        most_talked_about_topics: {
          title: 'Most Talked About Topics',
          edit_topics_and_subtopics: 'Edit Topics',
          see_all: 'See All',
          no_topics: 'No Topics',
          no_topics_description: 'No topics description',
          add_first_topic: 'Add First Topic',
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

describe('MostTalkedAboutTopicsWidget', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockTopicsStore, storeOverrides);
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
    Object.assign(mockTopicsStore, {
      topicsDistributionCount: { value: 5 },
      topicsDistribution: { value: [] },
      isLoadingTopicsDistribution: { value: false },
      topicType: { value: 'HUMAN' },
      hasExistingTopics: { value: true },
    });
    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render main section', () => {
      expect(section().exists()).toBe(true);
    });

    it('should render with existing topics', () => {
      wrapper = createWrapper({
        hasExistingTopics: { value: true },
        isLoadingTopicsDistribution: { value: false },
      });

      expect(section().exists()).toBe(true);
    });

    it('should render when loading', () => {
      wrapper = createWrapper({
        hasExistingTopics: { value: false },
        isLoadingTopicsDistribution: { value: true },
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
        hasExistingTopics: { value: true },
        topicsDistributionCount: { value: 0 },
      });

      expect(wrapper.vm.treemapData).toEqual([]);
    });

    it('should use store distribution when has existing topics', () => {
      const mockDistribution = [{ label: 'Topic', value: 100, percentage: 50 }];
      wrapper = createWrapper({
        hasExistingTopics: { value: true },
        topicsDistributionCount: { value: 1 },
        topicsDistribution: { value: mockDistribution },
      });

      expect(wrapper.vm.treemapData).toEqual(mockDistribution);
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
      wrapper = createWrapper({ isLoadingTopicsDistribution: { value: true } });

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
          hasExistingTopics: { value: true },
          isLoadingTopicsDistribution: { value: false },
        },
        {
          hasExistingTopics: { value: false },
          isLoadingTopicsDistribution: { value: false },
        },
        {
          hasExistingTopics: { value: false },
          isLoadingTopicsDistribution: { value: true },
        },
      ];

      testCases.forEach((testCase) => {
        wrapper = createWrapper(testCase);
        expect(section().exists()).toBe(true);
      });
    });
  });
});
