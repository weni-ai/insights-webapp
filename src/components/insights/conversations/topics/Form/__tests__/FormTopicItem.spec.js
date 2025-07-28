import { beforeEach, describe, expect, it } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import FormTopicItem from '../FormTopicItem.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        conversations_dashboard: {
          form_topic: {
            sub_topics: 'Sub-topics',
            sub_topics_added: '{sub_topics} sub-topics added',
            add_sub_topic: 'Add Sub-topic',
          },
        },
      },
    },
  }),
];

const mockTopic = {
  name: 'Test Topic',
  context: 'Test context',
  isNew: true,
  subTopics: [
    {
      name: 'Sub-topic 1',
      context: 'Sub context 1',
      isNew: false,
      subTopics: [],
    },
    {
      name: 'Sub-topic 2',
      context: 'Sub context 2',
      isNew: true,
      subTopics: [],
    },
  ],
};

const createWrapper = (props = {}) => {
  return shallowMount(FormTopicItem, {
    props: {
      topic: mockTopic,
      topicIndex: 0,
      isSubTopic: false,
      ...props,
    },
    global: {
      stubs: {
        FormTopicCard: {
          template: '<div data-testid="stub-form-topic-card"></div>',
          emits: [
            'delete-topic',
            'update-topic-name',
            'update-topic-context',
            'toggle-sub-topics',
          ],
        },
        AddTopicButton: {
          template:
            '<button data-testid="stub-add-topic-button" @click="$emit(\'add-topic\')"></button>',
          emits: ['add-topic'],
        },
        ModalTopic: {
          template:
            '<div v-if="isOpen" data-testid="stub-modal-topic">{{ type }} - {{ text }}</div>',
          props: ['isOpen', 'type', 'text'],
          emits: ['primary-button-click', 'secondary-button-click'],
        },
        UnnnicIcon: {
          template: '<span data-testid="stub-unnnic-icon"></span>',
        },
      },
    },
  });
};

describe('FormTopicItem', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  // Element finders
  const formTopicItem = () => wrapper.find('[data-testid="form-topic-item"]');
  const formTopicCard = () => wrapper.find('[data-testid="form-topic-card"]');
  const formTopicItemFooter = () =>
    wrapper.find('[data-testid="form-topic-item-footer"]');
  const formTopicItemDivider = () =>
    wrapper.find('[data-testid="form-topic-item-divider"]');
  const subTopicsToggle = () =>
    wrapper.find('[data-testid="form-topic-item-sub-topics-toggle"]');
  const toggleIcon = () =>
    wrapper.find('[data-testid="form-topic-item-toggle-icon"]');
  const subTopicsTitle = () =>
    wrapper.find('[data-testid="form-topic-item-sub-topics-title"]');
  const subTopicsList = () =>
    wrapper.find('[data-testid="form-topic-item-sub-topics-list"]');
  const subTopicItems = () =>
    wrapper.findAll('[data-testid="form-topic-item-sub-topic"]');
  const addSubTopicButton = () =>
    wrapper.find('[data-testid="form-topic-item-add-sub-topic-button"]');
  const modal = () => wrapper.find('[data-testid="form-topic-item-modal"]');

  describe('Initial render', () => {
    it('should render the component with correct structure', () => {
      expect(formTopicItem().exists()).toBe(true);
      expect(formTopicCard().exists()).toBe(true);
      expect(wrapper.vm).toBeDefined();
    });

    it('should render footer when not a sub-topic', () => {
      wrapper = createWrapper({ isSubTopic: false });

      expect(formTopicItemFooter().exists()).toBe(true);
    });

    it('should not render footer when is a sub-topic', () => {
      wrapper = createWrapper({ isSubTopic: true });

      expect(formTopicItemFooter().exists()).toBe(false);
    });
  });

  describe('Conditional rendering', () => {
    const renderingTests = [
      {
        scenario: 'new topic with sub-topics hidden',
        props: { topic: { ...mockTopic, isNew: true } },
        checks: {
          divider: false,
          toggleIcon: true,
          subTopicsTitle: true,
          subTopicsList: false,
        },
      },
      {
        scenario: 'API topic with sub-topics hidden',
        props: { topic: { ...mockTopic, isNew: false } },
        checks: {
          divider: false,
          toggleIcon: false,
          subTopicsTitle: false,
          subTopicsList: false,
        },
      },
    ];

    renderingTests.forEach(({ scenario, props, checks }) => {
      it(`should render correctly for ${scenario}`, () => {
        wrapper = createWrapper(props);

        expect(formTopicItemDivider().exists()).toBe(checks.divider);
        expect(toggleIcon().exists()).toBe(checks.toggleIcon);
        expect(subTopicsTitle().exists()).toBe(checks.subTopicsTitle);
        expect(subTopicsList().exists()).toBe(checks.subTopicsList);
      });
    });

    it('should show divider and title when API topic has sub-topics visible', async () => {
      wrapper = createWrapper({ topic: { ...mockTopic, isNew: false } });

      wrapper.vm.showSubTopics = true;
      await nextTick();

      expect(formTopicItemDivider().exists()).toBe(true);
      expect(subTopicsTitle().exists()).toBe(true);
    });

    it('should show sub-topics list when expanded', async () => {
      wrapper.vm.showSubTopics = true;
      await nextTick();

      expect(subTopicsList().exists()).toBe(true);
      expect(subTopicItems()).toHaveLength(mockTopic.subTopics.length);
      expect(addSubTopicButton().exists()).toBe(true);
    });
  });

  describe('Event handling', () => {
    it('should emit toggle-sub-topics when toggle is clicked', async () => {
      await subTopicsToggle().trigger('click');

      expect(wrapper.emitted('toggle-sub-topics')).toBeTruthy();
      expect(wrapper.emitted('toggle-sub-topics')[0]).toEqual([0]);
    });

    it('should emit add-sub-topic when add button is clicked', async () => {
      wrapper.vm.showSubTopics = true;
      await nextTick();

      await addSubTopicButton().trigger('click');

      expect(wrapper.emitted('add-sub-topic')).toBeTruthy();
      expect(wrapper.emitted('add-sub-topic')[0]).toEqual([0]);
    });

    it('should emit delete-topic when handleDeleteTopic is called', () => {
      wrapper.vm.handleDeleteTopic();

      expect(wrapper.emitted('delete-topic')).toBeTruthy();
      expect(wrapper.emitted('delete-topic')[0]).toEqual([0, undefined]);
    });

    it('should emit update-topic when updateTopicName is called', () => {
      wrapper.vm.updateTopicName('test');

      expect(wrapper.emitted('update-topic')).toBeTruthy();
      expect(wrapper.emitted('update-topic')[0]).toEqual([
        0,
        'name',
        'test',
        undefined,
      ]);
    });

    it('should emit update-topic when updateTopicContext is called', () => {
      wrapper.vm.updateTopicContext('test');

      expect(wrapper.emitted('update-topic')).toBeTruthy();
      expect(wrapper.emitted('update-topic')[0]).toEqual([
        0,
        'context',
        'test',
        undefined,
      ]);
    });
  });

  describe('Component methods', () => {
    it('should have all required methods', () => {
      const methods = [
        'updateTopicName',
        'updateTopicContext',
        'toggleSubTopics',
        'handleDeleteTopic',
        'primaryButtonClick',
        'secondaryButtonClick',
      ];

      methods.forEach((method) => {
        expect(typeof wrapper.vm[method]).toBe('function');
      });
    });

    it('should toggle showSubTopics when toggleSubTopics is called', () => {
      const initialValue = wrapper.vm.showSubTopics;

      wrapper.vm.toggleSubTopics();

      expect(wrapper.vm.showSubTopics).toBe(!initialValue);
      expect(wrapper.emitted('toggle-sub-topics')).toBeTruthy();
    });

    it('should emit delete-topic directly for new topics', () => {
      wrapper = createWrapper({ topic: { ...mockTopic, isNew: true } });

      wrapper.vm.handleDeleteTopic();

      expect(wrapper.emitted('delete-topic')).toBeTruthy();
      expect(wrapper.vm.isOpenModal).toBe(false);
    });

    it('should open modal for API topics', () => {
      wrapper = createWrapper({ topic: { ...mockTopic, isNew: false } });

      wrapper.vm.handleDeleteTopic();

      expect(wrapper.vm.isOpenModal).toBe(true);
      expect(wrapper.emitted('delete-topic')).toBeFalsy();
    });
  });

  describe('Modal functionality', () => {
    beforeEach(() => {
      wrapper = createWrapper({ topic: { ...mockTopic, isNew: false } });
      wrapper.vm.isOpenModal = true;
    });

    it('should emit delete-topic when primary button is clicked', () => {
      wrapper.vm.primaryButtonClick();

      expect(wrapper.emitted('delete-topic')).toBeTruthy();
      expect(wrapper.vm.isOpenModal).toBe(false);
    });

    it('should close modal when secondary button is clicked', () => {
      wrapper.vm.secondaryButtonClick();

      expect(wrapper.vm.isOpenModal).toBe(false);
      expect(wrapper.emitted('delete-topic')).toBeFalsy();
    });

    it('should pass correct modal props', async () => {
      await nextTick();

      const modalComponent = modal();
      expect(modalComponent.exists()).toBe(true);
      expect(modalComponent.text()).toContain('remove-topic');
      expect(modalComponent.text()).toContain(mockTopic.name);
    });
  });

  describe('Computed properties', () => {
    it('should return correct modal type for topic and sub-topic', () => {
      wrapper = createWrapper({ isSubTopic: false });
      expect(wrapper.vm.modalType).toBe('remove-topic');

      wrapper = createWrapper({ isSubTopic: true });
      expect(wrapper.vm.modalType).toBe('remove-sub-topic');
    });

    const nameTests = [
      { isSubTopic: false, name: 'Test Topic', expected: 'Test Topic' },
      { isSubTopic: false, name: '', expected: 'Unnamed Topic 1' },
      { isSubTopic: true, name: 'Test Sub-topic', expected: 'Test Sub-topic' },
      { isSubTopic: true, name: '', expected: 'Unnamed Sub-topic 1' },
    ];

    nameTests.forEach(({ isSubTopic, name, expected }) => {
      it(`should return "${expected}" for ${isSubTopic ? 'sub-topic' : 'topic'} with name "${name}"`, () => {
        wrapper = createWrapper({
          isSubTopic,
          topic: { ...mockTopic, name },
        });

        expect(wrapper.vm.topicOrSubTopicName).toBe(expected);
      });
    });

    it('should return correct sub-topics title for new and API topics', () => {
      wrapper = createWrapper({ topic: { ...mockTopic, isNew: true } });
      expect(wrapper.vm.subTopicsTitle).toBe('Sub-topics');

      wrapper = createWrapper({
        topic: {
          ...mockTopic,
          isNew: false,
          subTopics: [{ isNew: false }, { isNew: true }, { isNew: false }],
        },
      });
      expect(wrapper.vm.subTopicsTitle).toBe('2 sub-topics added');
    });
  });

  describe('Props validation', () => {
    it('should handle all prop combinations correctly', () => {
      const propCombinations = [
        { isSubTopic: false, topicIndex: 0 },
        { isSubTopic: true, topicIndex: 1, parentIndex: 0 },
        { isSubTopic: false, topicIndex: 2, parentIndex: undefined },
      ];

      propCombinations.forEach((props) => {
        wrapper = createWrapper(props);

        expect(wrapper.vm.$props.isSubTopic).toBe(props.isSubTopic);
        expect(wrapper.vm.$props.topicIndex).toBe(props.topicIndex);
        expect(wrapper.vm.$props.parentIndex).toBe(props.parentIndex);
      });
    });

    it('should handle different topic structures', () => {
      const topicVariations = [
        { ...mockTopic, subTopics: [] },
        { ...mockTopic, isNew: false },
        { name: '', context: '', isNew: true, subTopics: [] },
      ];

      topicVariations.forEach((topic) => {
        wrapper = createWrapper({ topic });
        expect(wrapper.vm.$props.topic).toEqual(topic);
      });
    });
  });
});
