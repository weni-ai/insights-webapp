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

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { emojis } from '@emoji-mart/data';

defineOptions({ name: 'SelectEmojiButton' });

interface SelectEmojiButtonProps {
  modelValue?: string;
  pickerPosition?: string;
}

const props = withDefaults(defineProps<SelectEmojiButtonProps>(), {
  modelValue: '',
  pickerPosition: 'top',
});

const emit = defineEmits<{
  'update:model-value': [value: string];
}>();

const isEmojiPickerOpen = ref(false);
const isMounted = ref(false);

const selectedEmoji = computed(() => {
  if (!props.modelValue) return '';
  return (emojis as any)[props.modelValue]?.skins?.[0]?.native || '';
});

const openEmojiPicker = () => {
  if (isMounted.value) {
    isEmojiPickerOpen.value = true;
  }
};

const closeEmojiPicker = () => {
  isEmojiPickerOpen.value = false;
};

const toggleEmojiPicker = () => {
  if (isMounted.value) {
    isEmojiPickerOpen.value ? closeEmojiPicker() : openEmojiPicker();
  }
};

const handleEmoji = () => {
  if (selectedEmoji.value) {
    emit('update:model-value', '');
  } else {
    toggleEmojiPicker();
  }
};

const handleInput = (event: string) => {
  emit('update:model-value', event);
  closeEmojiPicker();
};

onMounted(() => {
  isMounted.value = true;
});
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
