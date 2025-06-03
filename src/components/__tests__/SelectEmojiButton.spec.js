import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import SelectEmojiButton from '@/components/SelectEmojiButton.vue';

// Mock emoji data
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
              '<div class="unnnic-emoji-picker" :data-position="position"></div>',
            props: ['returnName', 'position'],
            emits: ['emoji-selected', 'close'],
          },
        },
        mocks: {
          $t: (key) => key,
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Structure', () => {
    it('should render the component with correct structure', () => {
      expect(wrapper.find('.select-emoji-button').exists()).toBe(true);
      expect(wrapper.element.tagName).toBe('BUTTON');
    });

    it('should have correct component name', () => {
      expect(wrapper.vm.$options.name).toBe('SelectEmojiButton');
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

    it('should validate pickerPosition prop', () => {
      const validator = wrapper.vm.$options.props.pickerPosition.validator;
      expect(validator('top')).toBe(true);
      expect(validator('bottom')).toBe(true);
      expect(validator('left')).toBe(false);
      expect(validator('right')).toBe(false);
    });
  });

  describe('Initial State', () => {
    it('should initialize with emoji picker closed', () => {
      expect(wrapper.vm.isEmojiPickerOpen).toBe(false);
    });

    it('should not show selected emoji section when no value', () => {
      const selectedEmoji = wrapper.find(
        '.select-emoji-button__selected-emoji',
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
        '.select-emoji-button__selected-emoji',
      );
      const icon = wrapper.findComponent('[data-icon="add_reaction"]');

      expect(selectedEmoji.exists()).toBe(true);
      expect(icon.exists()).toBe(false);
    });

    it('should display correct emoji native character', () => {
      const selectedEmoji = wrapper.find(
        '.select-emoji-button__selected-emoji',
      );
      expect(selectedEmoji.text()).toBe('😀');
    });
  });

  describe('Computed Properties', () => {
    it('should return empty string when no modelValue', () => {
      expect(wrapper.vm.selectedEmoji).toBe('');
    });

    it('should return correct emoji native when modelValue exists', () => {
      wrapper = createWrapper({ modelValue: 'smile' });
      expect(wrapper.vm.selectedEmoji).toBe('😀');
    });

    it('should return empty string for invalid emoji key', () => {
      wrapper = createWrapper({ modelValue: 'invalid_emoji' });
      expect(wrapper.vm.selectedEmoji).toBe('');
    });

    it('should handle different emoji types', () => {
      wrapper = createWrapper({ modelValue: 'heart' });
      expect(wrapper.vm.selectedEmoji).toBe('❤️');
    });
  });

  describe('Methods', () => {
    describe('openEmojiPicker', () => {
      it('should set isEmojiPickerOpen to true', () => {
        wrapper.vm.openEmojiPicker();
        expect(wrapper.vm.isEmojiPickerOpen).toBe(true);
      });
    });

    describe('closeEmojiPicker', () => {
      it('should set isEmojiPickerOpen to false', () => {
        wrapper.vm.isEmojiPickerOpen = true;
        wrapper.vm.closeEmojiPicker();
        expect(wrapper.vm.isEmojiPickerOpen).toBe(false);
      });
    });

    describe('toggleEmojiPicker', () => {
      it('should open picker when closed', () => {
        wrapper.vm.isEmojiPickerOpen = false;
        wrapper.vm.toggleEmojiPicker();
        expect(wrapper.vm.isEmojiPickerOpen).toBe(true);
      });

      it('should close picker when open', () => {
        wrapper.vm.isEmojiPickerOpen = true;
        wrapper.vm.toggleEmojiPicker();
        expect(wrapper.vm.isEmojiPickerOpen).toBe(false);
      });
    });

    describe('handleEmoji', () => {
      it('should clear emoji when one is selected', async () => {
        wrapper = createWrapper({ modelValue: 'smile' });

        await wrapper.vm.handleEmoji();

        expect(wrapper.emitted('update:model-value')).toBeTruthy();
        expect(wrapper.emitted('update:model-value')[0][0]).toBe('');
      });

      it('should toggle picker when no emoji is selected', () => {
        const toggleSpy = vi.spyOn(wrapper.vm, 'toggleEmojiPicker');

        wrapper.vm.handleEmoji();

        expect(toggleSpy).toHaveBeenCalled();
      });
    });

    describe('handleInput', () => {
      it('should emit update:model-value with event data', async () => {
        await wrapper.vm.handleInput('smile');

        expect(wrapper.emitted('update:model-value')).toBeTruthy();
        expect(wrapper.emitted('update:model-value')[0][0]).toBe('smile');
      });

      it('should close emoji picker after input', async () => {
        wrapper.vm.isEmojiPickerOpen = true;

        await wrapper.vm.handleInput('smile');

        expect(wrapper.vm.isEmojiPickerOpen).toBe(false);
      });
    });
  });

  describe('Events', () => {
    it('should handle button click', async () => {
      const handleEmojiSpy = vi.spyOn(wrapper.vm, 'handleEmoji');

      await wrapper.find('.select-emoji-button').trigger('click');

      expect(handleEmojiSpy).toHaveBeenCalled();
    });

    it('should handle emoji picker emoji-selected event', async () => {
      wrapper.vm.isEmojiPickerOpen = true;
      await wrapper.vm.$nextTick();

      const emojiPicker = wrapper.findComponent('[data-position="top"]');
      await emojiPicker.vm.$emit('emoji-selected', 'thumbsup');

      expect(wrapper.emitted('update:model-value')).toBeTruthy();
      expect(wrapper.emitted('update:model-value')[0][0]).toBe('thumbsup');
      expect(wrapper.vm.isEmojiPickerOpen).toBe(false);
    });

    it('should handle emoji picker close event', async () => {
      wrapper.vm.isEmojiPickerOpen = true;
      await wrapper.vm.$nextTick();

      const emojiPicker = wrapper.findComponent('[data-position="top"]');
      await emojiPicker.vm.$emit('close');

      expect(wrapper.vm.isEmojiPickerOpen).toBe(false);
    });
  });

  describe('Emoji Picker Visibility', () => {
    it('should show emoji picker when isEmojiPickerOpen is true', async () => {
      wrapper.vm.isEmojiPickerOpen = true;
      await wrapper.vm.$nextTick();

      const emojiPicker = wrapper.findComponent('[data-position="top"]');
      expect(emojiPicker.exists()).toBe(true);
    });

    it('should hide emoji picker when isEmojiPickerOpen is false', () => {
      wrapper.vm.isEmojiPickerOpen = false;

      const emojiPicker = wrapper.find('.unnnic-emoji-picker');
      expect(emojiPicker.isVisible()).toBe(false);
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
