<template>
  <UnnnicCollapse
    class="form-accordion"
    data-test-id="form-accordion"
    :class="{
      'form-accordion--active': active,
      highlighted: active && highlighted,
    }"
    :active="active"
    @change="$emit('update:active', $event)"
  >
    <template #header>
      <header class="form-accordion__header">
        <UnnnicIcon
          data-test-id="check_circle"
          icon="check_circle"
          :scheme="iconScheme"
          size="avatar-nano"
          filled
        />
        {{ title }}
      </header>
    </template>
    <slot name="content"></slot>
  </UnnnicCollapse>
</template>

<script>
export default {
  name: 'FormAccordion',

  props: {
    active: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    validConfig: {
      type: Boolean,
      default: false,
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:active'],

  computed: {
    iconScheme() {
      return this.validConfig ? 'weni-600' : 'neutral-soft';
    },
  },
};
</script>

<style lang="scss" scoped>
.form-accordion {
  border-radius: $unnnic-radius-1;
  border: 1px solid $unnnic-color-gray-2;

  &--active.highlighted {
    background-color: $unnnic-color-teal-1;
    border: 1px solid $unnnic-color-teal-7;
  }

  :deep(.unnnic-collapse__header) {
    padding: $unnnic-space-3;
  }

  :deep(.unnnic-collapse__body) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;

    margin-top: - calc($unnnic-space-3 + $unnnic-space-1);
    padding: $unnnic-space-2 $unnnic-space-3 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-space-1;

    color: $unnnic-color-gray-10;
    font-size: 14px;
    font-weight: $unnnic-font-weight-bold;
    line-height: 4px * 5.5;
  }
}
</style>
