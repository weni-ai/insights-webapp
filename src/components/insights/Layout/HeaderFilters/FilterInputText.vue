<template>
  <UnnnicInput
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    iconRight="search"
    :placeholder="placeholder"
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
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
};
</script>
