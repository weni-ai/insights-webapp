import { beforeEach, describe, expect, it } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import ModalTopic from '../ModalTopic.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
    messages: {
      en: {
        conversations_dashboard: {
          form_topic: {
            remove_modal: {
              title_remove_topic: 'Remove Topic',
              title_remove_sub_topic: 'Remove Sub-topic',
              description_remove_topic: 'Remove topic {topic}?',
              description_remove_sub_topic: 'Remove sub-topic {sub_topic}?',
              remove: 'Remove',
              cancel: 'Cancel',
            },
            cancel_modal: {
              title: 'Cancel Changes',
              description_cancel: 'Are you sure you want to cancel?',
              cancel: 'Yes, Cancel',
              continue: 'Continue Editing',
            },
          },
        },
      },
    },
  }),
];

const createWrapper = (props = {}) => {
  return shallowMount(ModalTopic, {
    props: { isOpen: true, type: 'remove-topic', ...props },
    global: {
      stubs: {
        UnnnicModalDialog: {
          template: '<div v-bind="$attrs"><slot /></div>',
        },
      },
    },
  });
};

describe('ModalTopic', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const modalTopic = () => wrapper.find('[data-testid="modal-topic"]');

  describe('Initial render', () => {
    it('should render the component with correct structure', () => {
      expect(modalTopic().exists()).toBe(true);
      expect(wrapper.vm).toBeDefined();
    });

    it('should display modal when isOpen is true', () => {
      expect(modalTopic().attributes('modelvalue')).toBe('true');
    });

    it('should not display modal when isOpen is false', () => {
      wrapper = createWrapper({ isOpen: false });
      expect(modalTopic().attributes('modelvalue')).toBe('false');
    });
  });

  describe('Modal types configuration', () => {
    const modalTypes = [
      {
        type: 'remove-topic',
        expectedType: 'warning',
        expectedIcon: 'warning',
        title: 'Remove Topic',
      },
      {
        type: 'remove-sub-topic',
        expectedType: 'warning',
        expectedIcon: 'warning',
        title: 'Remove Sub-topic',
      },
      {
        type: 'cancel-topic',
        expectedType: 'attention',
        expectedIcon: 'error',
        title: 'Cancel Changes',
      },
    ];

    modalTypes.forEach(({ type, expectedType, expectedIcon, title }) => {
      it(`should configure ${type} modal correctly`, () => {
        wrapper = createWrapper({ type });
        const modal = modalTopic();

        expect(modal.attributes('type')).toBe(expectedType);
        expect(modal.attributes('icon')).toBe(expectedIcon);
        expect(modal.attributes('title')).toBe(title);
      });
    });
  });

  describe('Modal content with text prop', () => {
    it('should display remove topic description with text', () => {
      const topicName = 'Test Topic';
      wrapper = createWrapper({ type: 'remove-topic', text: topicName });

      expect(wrapper.text()).toContain(`Remove topic ${topicName}?`);
    });

    it('should display remove sub-topic description with text', () => {
      const subTopicName = 'Test Sub-topic';
      wrapper = createWrapper({ type: 'remove-sub-topic', text: subTopicName });

      expect(wrapper.text()).toContain(`Remove sub-topic ${subTopicName}?`);
    });

    it('should display cancel description without text dependency', () => {
      wrapper = createWrapper({ type: 'cancel-topic' });

      expect(wrapper.text()).toContain('Are you sure you want to cancel?');
    });
  });

  describe('Button configurations', () => {
    const buttonConfigs = [
      {
        type: 'remove-topic',
        primaryText: 'Remove',
        secondaryText: 'Cancel',
      },
      {
        type: 'remove-sub-topic',
        primaryText: 'Remove',
        secondaryText: 'Cancel',
      },
      {
        type: 'cancel-topic',
        primaryText: 'Yes, Cancel',
        secondaryText: 'Continue Editing',
      },
    ];

    buttonConfigs.forEach(({ type }) => {
      it(`should configure ${type} buttons correctly`, () => {
        wrapper = createWrapper({ type });
        const modal = modalTopic();

        expect(modal.attributes('primarybuttonprops')).toBeDefined();
        expect(modal.attributes('secondarybuttonprops')).toBeDefined();
      });
    });
  });

  describe('Event handling', () => {
    it('should emit primary-button-click when primaryButtonClick is called', () => {
      wrapper = createWrapper();
      wrapper.vm.primaryButtonClick();

      expect(wrapper.emitted('primary-button-click')).toBeTruthy();
      expect(wrapper.emitted('primary-button-click')).toHaveLength(1);
    });

    it('should emit secondary-button-click when secondaryButtonClick is called', () => {
      wrapper = createWrapper();
      wrapper.vm.secondaryButtonClick();

      expect(wrapper.emitted('secondary-button-click')).toBeTruthy();
      expect(wrapper.emitted('secondary-button-click')).toHaveLength(1);
    });

    it('should emit events multiple times when methods are called multiple times', () => {
      wrapper = createWrapper();
      wrapper.vm.primaryButtonClick();
      wrapper.vm.secondaryButtonClick();
      wrapper.vm.primaryButtonClick();

      expect(wrapper.emitted('primary-button-click')).toHaveLength(2);
      expect(wrapper.emitted('secondary-button-click')).toHaveLength(1);
    });
  });

  describe('Props validation', () => {
    it('should handle default props correctly', () => {
      wrapper = createWrapper({});

      expect(wrapper.vm.$props.type).toBe('remove-topic');
      expect(wrapper.vm.$props.isOpen).toBe(true);
      expect(wrapper.vm.$props.text).toBe('');
    });

    it('should handle empty text prop gracefully', () => {
      wrapper = createWrapper({ text: '', type: 'remove-topic' });

      expect(wrapper.text()).toContain('Remove topic ?');
    });
  });

  describe('Component integration', () => {
    it('should maintain proper modal dialog attributes', () => {
      const modal = modalTopic();

      expect(modal.attributes('showcloseicon')).toBeDefined();
      expect(modal.attributes('size')).toBe('sm');
    });

    it('should have working click handlers', () => {
      expect(typeof wrapper.vm.primaryButtonClick).toBe('function');
      expect(typeof wrapper.vm.secondaryButtonClick).toBe('function');
    });
  });
});
