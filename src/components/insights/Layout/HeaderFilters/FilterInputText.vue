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

<script setup lang="ts">
defineOptions({ name: 'FilterInputText' });

interface FilterInputTextProps {
  modelValue?: string;
  placeholder?: string;
  iconPosition?: string;
}

withDefaults(defineProps<FilterInputTextProps>(), {
  modelValue: '',
  placeholder: '',
  iconPosition: 'right',
});

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>
