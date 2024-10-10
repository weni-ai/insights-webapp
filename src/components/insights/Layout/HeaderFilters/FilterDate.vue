<template>
  <UnnnicInputDatePicker
    class="filter-date"
    :modelValue="modelValue"
    size="sm"
    :inputFormat="$t('date_format')"
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

  :deep(.unnnic-form-input) {
    height: 100%;

    &.text-input > .unnnic-icon {
      transform: translateY(-50%);
      top: 50%;
    }

    .input {
      font-size: $unnnic-font-size-body-gt;
    }
  }
}
</style>
