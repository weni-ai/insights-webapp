<template>
  <UnnnicCollapse
    class="metric-accordion"
    :class="{
      'metric-accordion--active': active,
      highlighted: active && highlighted,
    }"
    :active="active"
    @change="$emit('update:active', $event)"
  >
    <template #header>
      <header class="metric-accordion__header">
        <UnnnicIcon
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
  name: 'MetricAccordion',

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
.metric-accordion {
  border-radius: $unnnic-border-radius-sm;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  &--active.highlighted {
    background-color: $unnnic-color-weni-50;
    border: 1px solid $unnnic-color-weni-500;
  }

  :deep(.unnnic-collapse__header) {
    padding: $unnnic-spacing-ant;
  }

  :deep(.unnnic-collapse__body) {
    margin: 0;
    padding: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-nano;

    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-line-height-small * 5.5;
  }
}
</style>
