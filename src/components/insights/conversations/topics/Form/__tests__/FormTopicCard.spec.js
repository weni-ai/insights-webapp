import { beforeEach, describe, expect, it } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import FormTopicCard from '../FormTopicCard.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        conversations_dashboard: {
          form_topic: {
            new_topic: 'New Topic',
            new_sub_topic: 'New Sub-topic',
            topic_name: 'Topic Name',
            context: 'Context',
            context_description: 'Provide context for this topic',
          },
        },
      },
    },
  }),
];

const mockTopic = {
  name: 'Test Topic',
  context: 'Test context description',
  isNew: true,
  subTopics: [],
};

const createWrapper = (props = {}) => {
  return shallowMount(FormTopicCard, {
    props: {
      showSubTopics: false,
      topic: mockTopic,
      isNew: true,
      isSubTopic: false,
      ...props,
    },
    global: {
      stubs: {
        UnnnicButton: {
          template:
            '<button v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
          emits: ['click'],
        },
        UnnnicInput: {
          template: '<input v-bind="$attrs" @input="handleInput" />',
          emits: ['update:model-value'],
          methods: {
            handleInput(event) {
              this.$emit('update:model-value', event.target.value);
            },
          },
        },
        UnnnicIcon: {
          template: '<span v-bind="$attrs"><slot /></span>',
        },
      },
    },
  });
};

describe('FormTopicCard', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  // Element finders
  const formTopicCard = () => wrapper.find('[data-testid="form-topic-card"]');
  const formSection = () =>
    wrapper.find('[data-testid="form-topic-card-form"]');
  const itemSection = () =>
    wrapper.find('[data-testid="form-topic-card-item"]');
  const formTitle = () => wrapper.find('[data-testid="form-topic-card-title"]');
  const formDeleteButton = () =>
    wrapper.find('[data-testid="form-topic-card-delete-button"]');
  const nameInput = () =>
    wrapper.find('[data-testid="form-topic-card-name-input"]');
  const contextInput = () =>
    wrapper.find('[data-testid="form-topic-card-context-input"]');
  const characterCount = () =>
    wrapper.find('[data-testid="form-topic-card-character-count"]');
  const itemTitle = () =>
    wrapper.find('[data-testid="form-topic-card-item-title"]');
  const itemDescription = () =>
    wrapper.find('[data-testid="form-topic-card-item-description"]');
  const itemDeleteButton = () =>
    wrapper.find('[data-testid="form-topic-card-item-delete-button"]');
  const toggleButton = () =>
    wrapper.find('[data-testid="form-topic-card-toggle"]');

  describe('Initial render', () => {
    it('should render the component with correct structure', () => {
      expect(formTopicCard().exists()).toBe(true);
      expect(wrapper.vm).toBeDefined();
    });
  });

  describe('Conditional rendering based on isNew prop', () => {
    it('should show form view when isNew is true', () => {
      wrapper = createWrapper({ isNew: true });

      expect(formSection().exists()).toBe(true);
      expect(itemSection().exists()).toBe(false);
    });

    it('should show item view when isNew is false', () => {
      wrapper = createWrapper({ isNew: false });

      expect(formSection().exists()).toBe(false);
      expect(itemSection().exists()).toBe(true);
    });
  });

  describe('Form view (isNew: true)', () => {
    beforeEach(() => {
      wrapper = createWrapper({ isNew: true });
    });

    const titleTestCases = [
      {
        showSubTopics: false,
        expectedText: 'conversations_dashboard.form_topic.new_topic',
      },
      {
        showSubTopics: true,
        expectedText: 'conversations_dashboard.form_topic.new_sub_topic',
      },
    ];

    titleTestCases.forEach(({ showSubTopics, expectedText }) => {
      const displayText = showSubTopics
        ? 'new sub-topic title'
        : 'new topic title';
      it(`should display ${displayText} when showSubTopics is ${showSubTopics}`, () => {
        wrapper = createWrapper({ isNew: true, showSubTopics });

        expect(formTitle().text()).toBe(expectedText);
      });
    });

    it('should display topic name in name input', () => {
      const topicName = 'Custom Topic Name';
      wrapper = createWrapper({
        isNew: true,
        topic: { ...mockTopic, name: topicName },
      });

      expect(nameInput().attributes('modelvalue')).toBe(topicName);
    });

    it('should display topic context in context input', () => {
      const topicContext = 'Custom context description';
      wrapper = createWrapper({
        isNew: true,
        topic: { ...mockTopic, context: topicContext },
      });

      expect(contextInput().attributes('modelvalue')).toBe(topicContext);
    });

    it('should display correct character count', () => {
      const contextText = 'Test context';
      wrapper = createWrapper({
        isNew: true,
        topic: { ...mockTopic, context: contextText },
      });

      expect(characterCount().text()).toBe(`${contextText.length}/100`);
    });
  });

  describe('Item view (isNew: false)', () => {
    const testTopic = {
      name: 'API Topic',
      context: 'Topic from API',
      isNew: false,
      subTopics: [],
    };

    beforeEach(() => {
      wrapper = createWrapper({ isNew: false, topic: testTopic });
    });

    it('should display topic name and context', () => {
      expect(itemTitle().text()).toBe(testTopic.name);
      expect(itemDescription().text()).toBe(testTopic.context);
    });

    it('should show toggle when not a sub-topic', () => {
      wrapper = createWrapper({
        isNew: false,
        isSubTopic: false,
        topic: testTopic,
      });

      expect(toggleButton().exists()).toBe(true);
    });

    it('should hide toggle when it is a sub-topic', () => {
      wrapper = createWrapper({
        isNew: false,
        isSubTopic: true,
        topic: testTopic,
      });

      expect(toggleButton().exists()).toBe(false);
    });
  });

  describe('Event handling', () => {
    it('should emit delete-topic when form delete button is clicked', async () => {
      wrapper = createWrapper({ isNew: true });

      await formDeleteButton().trigger('click');

      expect(wrapper.emitted('delete-topic')).toBeTruthy();
      expect(wrapper.emitted('delete-topic')).toHaveLength(1);
    });

    it('should emit delete-topic when item delete button is clicked', async () => {
      wrapper = createWrapper({ isNew: false });

      await itemDeleteButton().trigger('click');

      expect(wrapper.emitted('delete-topic')).toBeTruthy();
      expect(wrapper.emitted('delete-topic')).toHaveLength(1);
    });

    it('should emit toggle-sub-topics when toggle is clicked', async () => {
      wrapper = createWrapper({ isNew: false, isSubTopic: false });

      await toggleButton().trigger('click');

      expect(wrapper.emitted('toggle-sub-topics')).toBeTruthy();
      expect(wrapper.emitted('toggle-sub-topics')).toHaveLength(1);
    });

    it('should emit update-topic-name when name input changes', async () => {
      wrapper = createWrapper({ isNew: true });
      const newName = 'Updated Topic Name';

      const input = nameInput();
      input.element.value = newName;
      await input.trigger('input');

      expect(wrapper.emitted('update-topic-name')).toBeTruthy();
      expect(wrapper.emitted('update-topic-name')[0]).toEqual([newName]);
    });

    it('should emit update-topic-context when context input changes', async () => {
      wrapper = createWrapper({ isNew: true });
      const newContext = 'Updated context';

      const input = contextInput();
      input.element.value = newContext;
      await input.trigger('input');

      expect(wrapper.emitted('update-topic-context')).toBeTruthy();
      expect(wrapper.emitted('update-topic-context')[0]).toEqual([newContext]);
    });
  });

  describe('Component methods', () => {
    it('should have all required handler methods', () => {
      wrapper = createWrapper({ isNew: true });

      const methods = [
        'handleDeleteTopic',
        'updateTopicName',
        'updateTopicContext',
        'toggleSubTopics',
      ];

      methods.forEach((method) => {
        expect(typeof wrapper.vm[method]).toBe('function');
      });
    });

    it('should call correct methods for event emissions', () => {
      wrapper = createWrapper({ isNew: true });

      wrapper.vm.handleDeleteTopic();
      expect(wrapper.emitted('delete-topic')).toHaveLength(1);

      wrapper.vm.updateTopicName('test');
      expect(wrapper.emitted('update-topic-name')).toHaveLength(1);

      wrapper.vm.updateTopicContext('test');
      expect(wrapper.emitted('update-topic-context')).toHaveLength(1);

      wrapper.vm.toggleSubTopics();
      expect(wrapper.emitted('toggle-sub-topics')).toHaveLength(1);
    });
  });

  describe('Props validation', () => {
    it('should handle all prop combinations correctly', () => {
      const propCombinations = [
        { isNew: true, isSubTopic: false, showSubTopics: false },
        { isNew: true, isSubTopic: true, showSubTopics: true },
        { isNew: false, isSubTopic: false, showSubTopics: false },
        { isNew: false, isSubTopic: true, showSubTopics: true },
      ];

      propCombinations.forEach((props) => {
        wrapper = createWrapper(props);
        expect(wrapper.vm.$props.isNew).toBe(props.isNew);
        expect(wrapper.vm.$props.isSubTopic).toBe(props.isSubTopic);
        expect(wrapper.vm.$props.showSubTopics).toBe(props.showSubTopics);
      });
    });

    it('should handle different topic content', () => {
      const topics = [
        { name: '', context: '' },
        { name: 'Short', context: 'Short context' },
        {
          name: 'Very long topic name that exceeds normal length',
          context:
            'Very long context description that might test text overflow and character limits in the component display',
        },
      ];

      topics.forEach((topic) => {
        wrapper = createWrapper({ topic: { ...mockTopic, ...topic } });
        expect(wrapper.vm.$props.topic.name).toBe(topic.name);
        expect(wrapper.vm.$props.topic.context).toBe(topic.context);
      });
    });
  });
});
