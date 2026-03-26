<template>
  <button
    :class="[
      'select-emoji-button',
      { 'select-emoji-button--selected': !!modelValue },
    ]"
    data-testid="select-emoji-button"
    @click.stop="handleEmoji"
  >
    <section
      v-if="modelValue"
      data-testid="select-emoji-button-selected-emoji"
      class="select-emoji-button__selected-emoji"
    >
      {{ selectedEmoji }}
    </section>
    <UnnnicIcon
      v-else
      icon="add_reaction"
      scheme="neutral-dark"
      size="avatar-nano"
    />
    <UnnnicEmojiPicker
      v-if="isEmojiPickerOpen && isMounted"
      data-testid="unnnic-emoji-picker"
      returnName
      :position="pickerPosition"
      :locale="$i18n.locale"
      @emoji-selected="handleInput"
      @close="closeEmojiPicker"
    />
  </button>
</template>

<script>
import { emojis } from '@emoji-mart/data';

export default {
  name: 'SelectEmojiButton',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    pickerPosition: {
      type: String,
      default: 'top',
      validator: (position) => ['top', 'bottom'].includes(position),
    },
  },

  emits: ['update:model-value'],

  data() {
    return {
      isEmojiPickerOpen: false,
      isMounted: false,
    };
  },

  computed: {
    selectedEmoji() {
      if (!this.modelValue) return '';
      const emoji = emojis[this.modelValue]?.skins?.[0]?.native || '';
      return emoji;
    },
  },

  mounted() {
    this.isMounted = true;
  },
  methods: {
    openEmojiPicker() {
      if (this.isMounted) {
        this.isEmojiPickerOpen = true;
      }
    },
    closeEmojiPicker() {
      this.isEmojiPickerOpen = false;
    },
    handleEmoji() {
      if (this.selectedEmoji) {
        this.$emit('update:model-value', '');
      } else {
        this.toggleEmojiPicker();
      }
    },
    toggleEmojiPicker() {
      if (this.isMounted) {
        this.isEmojiPickerOpen
          ? this.closeEmojiPicker()
          : this.openEmojiPicker();
      }
    },
    handleInput(event) {
      this.$emit('update:model-value', event);
      this.closeEmojiPicker();
    },
  },
};
</script>

<style lang="scss" scoped>
.select-emoji-button {
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  padding: $unnnic-space-1;

  border: 1px solid $unnnic-color-gray-4;
  border-radius: $unnnic-radius-4;
  background-color: $unnnic-color-gray-0;

  &--selected {
    border-color: $unnnic-color-teal-7;
    background-color: $unnnic-color-teal-1;
  }

  &__selected-emoji {
    height: 20px;
    width: 20px;
  }
}
</style>
