<template>
  <UnnnicInput
    data-testid="filter-input-text"
    :modelValue="modelValue"
    iconRight="search"
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
  },
  emits: ['update:modelValue'],
};
</script>
