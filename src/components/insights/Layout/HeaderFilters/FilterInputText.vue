<template>
  <UnnnicInput
    data-testid="filter-input-text"
    :modelValue="modelValue"
    :iconRight="iconPosition === 'right' ? 'search' : ''"
    :iconLeft="iconPosition === 'left' ? 'search' : ''"
    :placeholder="placeholder"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script>
export default {
  name: 'FilterInputText',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    iconPosition: {
      type: String,
      default: 'right',
    },
  },
  emits: ['update:modelValue'],
};
</script>
