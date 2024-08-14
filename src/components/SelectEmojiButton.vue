<template>
  <button
    :class="[
      'select-emoji-button',
      { 'select-emoji-button--selected': !!modelValue },
    ]"
    @click.stop="handleEmojiPicker"
  >
    <section
      v-if="modelValue"
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
      v-show="isEmojiPickerOpen"
      returnName
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
  },

  emits: ['update:model-value'],

  data() {
    return {
      isEmojiPickerOpen: false,
    };
  },
  computed: {
    selectedEmoji() {
      if (!this.modelValue) return '';
      const emoji = emojis[this.modelValue]?.skins?.[0]?.native || '';
      return emoji;
    },
  },
  methods: {
    openEmojiPicker() {
      this.isEmojiPickerOpen = true;
    },
    closeEmojiPicker() {
      this.isEmojiPickerOpen = false;
    },
    handleEmojiPicker() {
      if (this.isEmojiPickerOpen) {
        this.closeEmojiPicker();
      } else {
        this.openEmojiPicker();
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

  padding: $unnnic-spacing-nano;

  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-cleanest;
  border-radius: $unnnic-border-radius-lg;
  background-color: $unnnic-color-neutral-white;

  &--selected {
    border-color: $unnnic-color-weni-500;
    background-color: $unnnic-color-weni-50;
  }

  &__selected-emoji {
    height: $unnnic-avatar-size-nano;
    width: $unnnic-avatar-size-nano;
  }
}
</style>
