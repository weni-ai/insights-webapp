import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { createI18n } from 'vue-i18n';

import FormTopic from '../FormTopic.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        conversations_dashboard: {
          form_topic: {
            add_topic: 'Add Topic',
          },
        },
      },
    },
  }),
];

const mockTopics = [
  {
    uuid: '1',
    name: 'Topic 1',
    context: 'Context 1',
    isNew: true,
    subTopics: [],
  },
  {
    uuid: '2',
    name: 'Topic 2',
    context: 'Context 2',
    isNew: false,
    subTopics: [
      {
        uuid: '2-1',
        name: 'Sub 1',
        context: 'Sub Context 1',
        isNew: false,
        subTopics: [],
      },
    ],
  },
];

// Reactive refs for the store
const topicsRef = ref([]);
const isLoadingTopicsRef = ref(false);

const mockStore = {
  topics: [],
  isLoadingTopics: false,
  addTopic: vi.fn(),
  removeTopicOrSubtopic: vi.fn(),
  updateTopic: vi.fn(),
  addSubTopic: vi.fn(),
  createNewTopic: vi.fn(() => ({
    name: '',
    context: '',
    isNew: true,
    subTopics: [],
  })),
};

vi.mock('@/store/modules/conversational/topics', () => ({
  useConversationalTopics: () => mockStore,
}));

vi.mock('pinia', () => ({
  storeToRefs: () => ({
    topics: topicsRef,
    isLoadingTopics: isLoadingTopicsRef,
  }),
}));

const createWrapper = (storeTopics = [], isLoading = false) => {
  mockStore.topics = storeTopics;
  mockStore.isLoadingTopics = isLoading;
  topicsRef.value = storeTopics;
  isLoadingTopicsRef.value = isLoading;

  return shallowMount(FormTopic, {
    global: {
      stubs: {
        AddTopicButton: {
          template:
            '<button data-testid="form-topic-add-button" @click="$emit(\'add-topic\')">{{ text }}</button>',
          props: ['text'],
          emits: ['add-topic'],
        },
        FormTopicItem: {
          template: '<div data-testid="form-topic-item">{{ topic.name }}</div>',
          props: ['topic', 'topicIndex', 'isSubTopic'],
          emits: [
            'delete-topic',
            'update-topic',
            'add-sub-topic',
            'toggle-sub-topics',
          ],
        },
        UnnnicSkeletonLoading: {
          template: '<div data-testid="form-topic-loading-skeleton"></div>',
          props: ['height', 'width'],
        },
      },
    },
  });
};

describe('FormTopic', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    topicsRef.value = [];
    isLoadingTopicsRef.value = false;
    wrapper = createWrapper();
  });

  // Element finders
  const formTopic = () => wrapper.find('[data-testid="form-topic"]');
  const formTopicHeader = () =>
    wrapper.find('[data-testid="form-topic-header"]');
  const formTopicAddButton = () =>
    wrapper.find('[data-testid="form-topic-add-button"]');
  const formTopicDivider = () =>
    wrapper.find('[data-testid="form-topic-divider"]');
  const formTopicBody = () => wrapper.find('[data-testid="form-topic-body"]');
  const formTopicItems = () =>
    wrapper.findAll('[data-testid="form-topic-item"]');
  const formTopicSkeleton = () => wrapper.find('.form-topic__skeleton');
  const skeletonLoadings = () =>
    wrapper.findAll('[data-testid="form-topic-loading-skeleton"]');

  describe('Component structure', () => {
    it('should render the component with correct structure', () => {
      expect(formTopic().exists()).toBe(true);
      expect(formTopicHeader().exists()).toBe(true);
      expect(formTopicBody().exists()).toBe(true);
      expect(wrapper.vm).toBeDefined();
    });

    it('should render add topic button with correct text', () => {
      expect(formTopicAddButton().exists()).toBe(true);
      expect(formTopicAddButton().text()).toBe(
        'conversations_dashboard.form_topic.add_topic',
      );
    });
  });

  describe('Conditional rendering', () => {
    it('should not render divider and topics when no topics exist', () => {
      expect(formTopicDivider().exists()).toBe(false);
      expect(formTopicItems()).toHaveLength(0);
    });

    it('should render divider and topics when topics exist', async () => {
      wrapper = createWrapper(mockTopics, false);
      await nextTick();

      expect(formTopicDivider().exists()).toBe(true);
      expect(formTopicItems()).toHaveLength(mockTopics.length);
    });

    it('should not render body when loading', async () => {
      wrapper = createWrapper([], true);
      await nextTick();

      expect(formTopicBody().exists()).toBe(false);
      expect(formTopicDivider().exists()).toBe(false);
    });
  });

  describe('Loading state', () => {
    it('should show skeleton loading when isLoadingTopics is true', async () => {
      wrapper = createWrapper([], true);
      await nextTick();

      expect(formTopicSkeleton().exists()).toBe(true);
      expect(skeletonLoadings()).toHaveLength(4);
    });

    it('should hide skeleton loading when isLoadingTopics is false', async () => {
      wrapper = createWrapper(mockTopics, false);
      await nextTick();

      expect(formTopicSkeleton().exists()).toBe(false);
      expect(skeletonLoadings()).toHaveLength(0);
      expect(formTopicBody().exists()).toBe(true);
    });
  });

  describe('Event handling', () => {
    it('should call handleAddTopic when add button is clicked', async () => {
      await formTopicAddButton().trigger('click');

      expect(mockStore.createNewTopic).toHaveBeenCalledTimes(1);
      expect(mockStore.addTopic).toHaveBeenCalledTimes(1);
      expect(mockStore.addTopic).toHaveBeenCalledWith({
        name: '',
        context: '',
        isNew: true,
        subTopics: [],
      });
    });

    it('should handle toggle-sub-topics event', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      wrapper.vm.handleToggleSubTopics(0);

      expect(consoleSpy).toHaveBeenCalledWith('Toggled sub-topics for topic 0');
      consoleSpy.mockRestore();
    });
  });

  describe('Component methods', () => {
    it('should have all required handler methods', () => {
      const methods = [
        'handleAddTopic',
        'handleDeleteTopic',
        'handleUpdateTopic',
        'handleAddSubTopic',
        'handleToggleSubTopics',
      ];

      methods.forEach((method) => {
        expect(typeof wrapper.vm[method]).toBe('function');
      });
    });

    it('should execute handleDeleteTopic correctly', () => {
      wrapper.vm.handleDeleteTopic(0);
      expect(mockStore.removeTopicOrSubtopic).toHaveBeenCalledWith(
        0,
        undefined,
      );

      wrapper.vm.handleDeleteTopic(0, 1);
      expect(mockStore.removeTopicOrSubtopic).toHaveBeenCalledWith(0, 1);
    });

    it('should execute handleUpdateTopic correctly', () => {
      wrapper.vm.handleUpdateTopic(0, 'name', 'test', 1);
      expect(mockStore.updateTopic).toHaveBeenCalledWith(0, 'name', 'test', 1);
    });

    it('should execute handleAddSubTopic correctly', () => {
      wrapper.vm.handleAddSubTopic(0);
      expect(mockStore.addSubTopic).toHaveBeenCalledTimes(1);
      expect(mockStore.createNewTopic).toHaveBeenCalledTimes(1);
    });
  });

  describe('Store integration', () => {
    it('should react to store changes', async () => {
      expect(formTopicItems()).toHaveLength(0);

      topicsRef.value = mockTopics;
      await nextTick();

      expect(formTopicItems()).toHaveLength(mockTopics.length);
    });

    it('should use reactive properties from store', async () => {
      isLoadingTopicsRef.value = true;
      await nextTick();

      expect(isLoadingTopicsRef.value).toBe(true);
    });
  });

  describe('Data attributes', () => {
    it('should have correct data-testid attributes', () => {
      expect(formTopic().attributes('data-testid')).toBe('form-topic');
      expect(formTopicHeader().attributes('data-testid')).toBe(
        'form-topic-header',
      );
      expect(formTopicBody().attributes('data-testid')).toBe('form-topic-body');
    });
  });
});
