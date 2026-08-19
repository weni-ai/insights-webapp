import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import SelectEmojiButton from '@/components/SelectEmojiButton.vue';

vi.mock('emoji-mart-vue-fast', () => ({
  emojis: {
    smile: {
      skins: [{ native: '😀' }],
    },
    heart: {
      skins: [{ native: '❤️' }],
    },
    thumbsup: {
      skins: [{ native: '👍' }],
    },
  },
}));

vi.mock('@emoji-mart/data', () => ({
  emojis: {
    smile: {
      skins: [{ native: '😀' }],
    },
    heart: {
      skins: [{ native: '❤️' }],
    },
    thumbsup: {
      skins: [{ native: '👍' }],
    },
  },
}));

describe('SelectEmojiButton', () => {
  let wrapper;

  const createWrapper = (props = {}) => {
    return mount(SelectEmojiButton, {
      props: {
        modelValue: '',
        pickerPosition: 'top',
        ...props,
      },
      global: {
        stubs: {
          UnnnicEmojiPicker: {
            name: 'UnnnicEmojiPicker',
            template:
              '<div class="unnnic-emoji-picker" data-testid="unnnic-emoji-picker" :data-position="position" :data-locale="locale"></div>',
            props: ['returnName', 'position', 'locale'],
            emits: ['emoji-selected', 'close'],
          },
          UnnnicIcon: {
            name: 'UnnnicIcon',
            template: '<div class="unnnic-icon" :data-icon="icon"></div>',
            props: ['icon', 'scheme', 'size'],
          },
        },
        mocks: {
          $t: (key) => key,
          $i18n: {
            locale: 'pt-BR',
          },
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render the component with correct structure', () => {
      expect(wrapper.find('[data-testid="select-emoji-button"]').exists()).toBe(
        true,
      );
      expect(wrapper.element.tagName).toBe('BUTTON');
    });

    it('should have correct component name', () => {
      expect(wrapper.vm.$.type.name).toBe('SelectEmojiButton');
    });
  });

  describe('Props', () => {
    it('should accept modelValue prop', () => {
      wrapper = createWrapper({ modelValue: 'smile' });
      expect(wrapper.props('modelValue')).toBe('smile');
    });

    it('should accept pickerPosition prop with default value', () => {
      expect(wrapper.props('pickerPosition')).toBe('top');
    });

    it('should accept valid pickerPosition values', () => {
      wrapper = createWrapper({ pickerPosition: 'bottom' });
      expect(wrapper.props('pickerPosition')).toBe('bottom');
    });
  });

  describe('Initial State', () => {
    it('should initialize with emoji picker closed', () => {
      expect(wrapper.find('[data-testid="unnnic-emoji-picker"]').exists()).toBe(
        false,
      );
    });

    it('should not show selected emoji section when no value', () => {
      const selectedEmoji = wrapper.find(
        '[data-testid="select-emoji-button-selected-emoji"]',
      );
      expect(selectedEmoji.exists()).toBe(false);
    });
  });

  describe('Selected State', () => {
    beforeEach(() => {
      wrapper = createWrapper({ modelValue: 'smile' });
    });

    it('should apply selected class when emoji is selected', () => {
      expect(wrapper.classes()).toContain('select-emoji-button--selected');
    });

    it('should show selected emoji instead of icon', () => {
      const selectedEmoji = wrapper.find(
        '[data-testid="select-emoji-button-selected-emoji"]',
      );
      const icon = wrapper.find('[data-icon="add_reaction"]');

      expect(selectedEmoji.exists()).toBe(true);
      expect(icon.exists()).toBe(false);
    });

    it('should display correct emoji native character', () => {
      const selectedEmoji = wrapper.find(
        '[data-testid="select-emoji-button-selected-emoji"]',
      );
      expect(selectedEmoji.text()).toBe('😀');
    });
  });

  describe('Computed Properties', () => {
    it('should return empty string when no modelValue', () => {
      expect(
        wrapper
          .find('[data-testid="select-emoji-button-selected-emoji"]')
          .exists(),
      ).toBe(false);
    });

    it('should return correct emoji native when modelValue exists', () => {
      wrapper = createWrapper({ modelValue: 'smile' });
      expect(
        wrapper
          .find('[data-testid="select-emoji-button-selected-emoji"]')
          .text(),
      ).toBe('😀');
    });

    it('should return empty string for invalid emoji key', () => {
      wrapper = createWrapper({ modelValue: 'invalid_emoji' });
      expect(
        wrapper
          .find('[data-testid="select-emoji-button-selected-emoji"]')
          .text(),
      ).toBe('');
    });

    it('should handle different emoji types', () => {
      wrapper = createWrapper({ modelValue: 'heart' });
      expect(
        wrapper
          .find('[data-testid="select-emoji-button-selected-emoji"]')
          .text(),
      ).toBe('❤️');
    });
  });

  describe('Methods', () => {
    it('should clear emoji when one is selected', async () => {
      wrapper = createWrapper({ modelValue: 'smile' });
      await wrapper
        .find('[data-testid="select-emoji-button"]')
        .trigger('click');
      expect(wrapper.emitted('update:model-value')).toBeTruthy();
      expect(wrapper.emitted('update:model-value')[0][0]).toBe('');
    });

    it('should toggle picker when no emoji is selected', async () => {
      await wrapper
        .find('[data-testid="select-emoji-button"]')
        .trigger('click');
      expect(wrapper.find('[data-testid="unnnic-emoji-picker"]').exists()).toBe(
        true,
      );
    });

    it('should emit update:model-value when picker selects emoji', async () => {
      await wrapper
        .find('[data-testid="select-emoji-button"]')
        .trigger('click');
      await wrapper
        .findComponent('[data-testid="unnnic-emoji-picker"]')
        .vm.$emit('emoji-selected', 'smile');
      expect(wrapper.emitted('update:model-value')[0][0]).toBe('smile');
      expect(wrapper.find('[data-testid="unnnic-emoji-picker"]').exists()).toBe(
        false,
      );
    });

    it('should handle emoji picker close event', async () => {
      await wrapper
        .find('[data-testid="select-emoji-button"]')
        .trigger('click');
      expect(wrapper.find('[data-testid="unnnic-emoji-picker"]').exists()).toBe(
        true,
      );
      await wrapper
        .findComponent('[data-testid="unnnic-emoji-picker"]')
        .vm.$emit('close');
      expect(wrapper.find('[data-testid="unnnic-emoji-picker"]').exists()).toBe(
        false,
      );
    });
  });

  describe('Events', () => {
    it('should handle button click', async () => {
      await wrapper
        .find('[data-testid="select-emoji-button"]')
        .trigger('click');

      expect(wrapper.find('[data-testid="unnnic-emoji-picker"]').exists()).toBe(
        true,
      );
    });
  });

  describe('Emoji Picker Visibility', () => {
    it('should hide emoji picker when closed', () => {
      const emojiPicker = wrapper.find('[data-testid="unnnic-emoji-picker"]');
      expect(emojiPicker.exists()).toBe(false);
    });
  });

  describe('CSS Classes', () => {
    it('should apply base class', () => {
      expect(wrapper.classes()).toContain('select-emoji-button');
    });

    it('should not apply selected class when no emoji', () => {
      expect(wrapper.classes()).not.toContain('select-emoji-button--selected');
    });

    it('should apply selected class when emoji is selected', () => {
      wrapper = createWrapper({ modelValue: 'smile' });
      expect(wrapper.classes()).toContain('select-emoji-button--selected');
    });
  });
});
