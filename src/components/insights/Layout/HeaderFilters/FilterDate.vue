<template>
  <UnnnicInputDatePicker
    class="filter-date"
    data-testid="filter-date"
    :modelValue="modelValue"
    :inputFormat="$t('date_format')"
    size="md"
    position="right"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script>
export default {
  name: 'FilterDate',
  props: {
    modelValue: {
      type: Object,
      default: () => {},
    },
  },
  emits: ['update:modelValue'],
};
</script>

<style lang="scss" scoped>
// .dropdown class comes from the unnnic component and is used here to override its style
.filter-date.dropdown {
  display: grid;
  height: 100%;
}
</style>
