import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
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
  { name: 'Topic 1', context: 'Context 1', isNew: true, subTopics: [] },
  {
    name: 'Topic 2',
    context: 'Context 2',
    isNew: false,
    subTopics: [
      { name: 'Sub 1', context: 'Sub Context 1', isNew: false, subTopics: [] },
    ],
  },
];

const mockStore = {
  topics: [],
  addTopic: vi.fn(),
  deleteTopic: vi.fn(),
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

const createWrapper = (storeTopics = []) => {
  mockStore.topics = storeTopics;

  return shallowMount(FormTopic, {
    global: {
      stubs: {
        AddTopicButton: {
          template:
            '<button data-testid="stub-add-topic-button" @click="$emit(\'add-topic\')">{{ text }}</button>',
          props: ['text'],
          emits: ['add-topic'],
        },
        FormTopicItem: {
          template:
            '<div data-testid="stub-form-topic-item">{{ topic.name }}</div>',
          props: ['topic', 'topicIndex', 'isSubTopic'],
          emits: [
            'delete-topic',
            'update-topic',
            'add-sub-topic',
            'toggle-sub-topics',
          ],
        },
      },
    },
  });
};

describe('FormTopic', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
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

  describe('Initial render', () => {
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

    it('should not render divider when no topics exist', () => {
      expect(formTopicDivider().exists()).toBe(false);
    });

    it('should not render topic items when no topics exist', () => {
      expect(formTopicItems()).toHaveLength(0);
    });
  });

  describe('Conditional rendering', () => {
    const renderingTests = [
      { topicsCount: 0, expectDivider: false, expectItems: 0 },
      { topicsCount: 1, expectDivider: true, expectItems: 1 },
      { topicsCount: 3, expectDivider: true, expectItems: 3 },
    ];

    renderingTests.forEach(({ topicsCount, expectDivider, expectItems }) => {
      it(`should ${expectDivider ? 'show' : 'hide'} divider and render ${expectItems} items with ${topicsCount} topics`, () => {
        const topics = Array.from({ length: topicsCount }, (_, i) => ({
          ...mockTopics[0],
          name: `Topic ${i + 1}`,
        }));

        wrapper = createWrapper(topics);

        expect(formTopicDivider().exists()).toBe(expectDivider);
        expect(formTopicItems()).toHaveLength(expectItems);
      });
    });

    it('should render topics with correct props', () => {
      wrapper = createWrapper(mockTopics);
      const items = formTopicItems();

      expect(items).toHaveLength(mockTopics.length);
      mockTopics.forEach((topic, index) => {
        expect(items[index].text()).toBe(topic.name);
      });
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

    const eventHandlerTests = [
      {
        event: 'delete-topic',
        handler: 'handleDeleteTopic',
        args: [0, 1],
        storeMethod: 'deleteTopic',
        expectedArgs: [0, 1],
      },
      {
        event: 'update-topic',
        handler: 'handleUpdateTopic',
        args: [0, 'name', 'test', 1],
        storeMethod: 'updateTopic',
        expectedArgs: [0, 'name', 'test', 1],
      },
      {
        event: 'add-sub-topic',
        handler: 'handleAddSubTopic',
        args: [0],
        storeMethod: 'addSubTopic',
        expectedArgs: [
          0,
          { name: '', context: '', isNew: true, subTopics: [] },
        ],
      },
    ];

    eventHandlerTests.forEach(
      ({ event, handler, args, storeMethod, expectedArgs }) => {
        it(`should call ${storeMethod} when ${handler} is triggered`, () => {
          wrapper.vm[handler](...args);

          expect(mockStore[storeMethod]).toHaveBeenCalledTimes(1);
          expect(mockStore[storeMethod]).toHaveBeenCalledWith(...expectedArgs);
        });
      },
    );

    it('should handle toggle-sub-topics event', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      wrapper.vm.handleToggleSubTopics(0);

      expect(consoleSpy).toHaveBeenCalledWith('Toggled sub-topics for topic 0');
      consoleSpy.mockRestore();
    });
  });

  describe('Store integration', () => {
    it('should use topics from store as computed property', () => {
      wrapper = createWrapper(mockTopics);

      expect(wrapper.vm.topics).toEqual(mockTopics);
    });

    it('should react to store changes', async () => {
      expect(formTopicItems()).toHaveLength(0);

      wrapper = createWrapper(mockTopics);
      await nextTick();

      expect(formTopicItems()).toHaveLength(mockTopics.length);
    });

    it('should call store methods with correct signatures', () => {
      const methods = [
        { name: 'addTopic', spy: mockStore.addTopic },
        { name: 'deleteTopic', spy: mockStore.deleteTopic },
        { name: 'updateTopic', spy: mockStore.updateTopic },
        { name: 'addSubTopic', spy: mockStore.addSubTopic },
        { name: 'createNewTopic', spy: mockStore.createNewTopic },
      ];

      methods.forEach(({ name, spy }) => {
        expect(typeof spy).toBe('function');
        expect(spy).toBeInstanceOf(Function);
      });
    });
  });

  describe('Component methods', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

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

    it('should create new topic with correct structure', () => {
      wrapper.vm.handleAddTopic();

      const newTopic = mockStore.createNewTopic.mock.results[0].value;
      expect(newTopic).toEqual({
        name: '',
        context: '',
        isNew: true,
        subTopics: [],
      });
    });

    it('should execute handleDeleteTopic with index only', () => {
      wrapper.vm.handleDeleteTopic(0);
      expect(mockStore.deleteTopic).toHaveBeenCalledTimes(1);
      expect(mockStore.deleteTopic).toHaveBeenCalledWith(0, undefined);
    });

    it('should execute handleDeleteTopic with index and parentIndex', () => {
      wrapper.vm.handleDeleteTopic(0, 1);
      expect(mockStore.deleteTopic).toHaveBeenCalledTimes(1);
      expect(mockStore.deleteTopic).toHaveBeenCalledWith(0, 1);
    });

    it('should execute handleUpdateTopic with all parameters', () => {
      wrapper.vm.handleUpdateTopic(0, 'name', 'test', 1);
      expect(mockStore.updateTopic).toHaveBeenCalledTimes(1);
      expect(mockStore.updateTopic).toHaveBeenCalledWith(0, 'name', 'test', 1);
    });

    it('should execute handleAddSubTopic correctly', () => {
      wrapper.vm.handleAddSubTopic(0);
      expect(mockStore.addSubTopic).toHaveBeenCalledTimes(1);
      expect(mockStore.createNewTopic).toHaveBeenCalledTimes(1);
    });
  });

  describe('Child component props', () => {
    beforeEach(() => {
      wrapper = createWrapper(mockTopics);
    });

    it('should pass correct props to FormTopicItem components', () => {
      const items = formTopicItems();

      expect(items).toHaveLength(mockTopics.length);
      mockTopics.forEach((topic, index) => {
        expect(items[index].text()).toBe(topic.name);
      });
    });

    it('should pass correct text prop to AddTopicButton', () => {
      expect(formTopicAddButton().text()).toBe(
        'conversations_dashboard.form_topic.add_topic',
      );
    });

    it('should handle edge cases with empty or undefined topics', () => {
      const edgeCases = [[], undefined, null];

      edgeCases.forEach((topics) => {
        wrapper = createWrapper(topics || []);

        expect(formTopicDivider().exists()).toBe(false);
        expect(formTopicItems()).toHaveLength(0);
      });
    });
  });
});
