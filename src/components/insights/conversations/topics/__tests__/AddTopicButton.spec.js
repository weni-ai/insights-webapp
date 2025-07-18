import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import AddTopicButton from '../AddTopicButton.vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const createWrapper = (props = {}) => {
  return shallowMount(AddTopicButton, {
    props: { text: 'Add Topic', ...props },
    global: {
      stubs: {
        UnnnicButton: true,
      },
    },
  });
};

describe('AddTopicButton', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const addTopicButton = () => wrapper.find('[data-testid="add-topic-button"]');

  describe('Initial render', () => {
    it('should render the component with correct structure', () => {
      expect(addTopicButton().exists()).toBe(true);
      expect(addTopicButton().classes()).toContain('add-topic-button');
    });

    it('should display the text prop correctly', () => {
      const customText = 'Custom Add Topic Text';
      wrapper = createWrapper({ text: customText });

      expect(addTopicButton().attributes('text')).toBe(customText);
    });

    it('should render with correct data-testid', () => {
      expect(addTopicButton().attributes('data-testid')).toBe(
        'add-topic-button',
      );
    });
  });

  describe('Event handling', () => {
    it('should emit add-topic event when clicked', async () => {
      await addTopicButton().trigger('click');

      expect(wrapper.emitted('add-topic')).toBeTruthy();
      expect(wrapper.emitted('add-topic')).toHaveLength(1);
    });

    it('should emit add-topic event multiple times when clicked multiple times', async () => {
      await addTopicButton().trigger('click');
      await addTopicButton().trigger('click');
      await addTopicButton().trigger('click');

      expect(wrapper.emitted('add-topic')).toHaveLength(3);
    });
  });

  describe('Props validation', () => {
    it('should handle different text prop values', () => {
      const testTexts = ['Add New Topic', 'Create Topic', ''];

      testTexts.forEach((text) => {
        wrapper = createWrapper({ text });
        expect(addTopicButton().attributes('text')).toBe(text);
      });
    });
  });

  describe('Component integration', () => {
    it('should maintain proper component structure and behavior', () => {
      expect(wrapper.vm).toBeDefined();
      expect(typeof wrapper.vm.handleAddTopic).toBe('function');
    });
  });
});
