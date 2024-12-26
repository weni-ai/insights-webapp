<template>
  <section
    :class="[
      'quality-template-message-flag',
      `quality-template-message-flag--${props.quality}`,
    ]"
  >
    <UnnnicIcon
      v-if="props.showDot"
      class="dot"
      icon="indicator"
      :scheme="colorMapper[props.quality]"
    />
    <p class="quality-template-message-flag__text">
      {{ $t('active') }} -
      {{ $t(`template_messages_dashboard.quality.${quality}`) }}
    </p>
    <UnnnicToolTip
      v-if="props.showInfo"
      class="info"
      enabled
      :text="$t('template_messages_dashboard.quality.more_info_tooltip')"
      enableHtml
    >
      <UnnnicIcon
        icon="info"
        :scheme="colorMapper[props.quality]"
        size="sm"
      />
    </UnnnicToolTip>
  </section>
</template>

<script setup>
const props = defineProps({
  showDot: {
    type: Boolean,
    default: false,
  },
  showInfo: {
    type: Boolean,
    default: false,
  },
  quality: {
    type: String,
    required: true,
    validate: (value) => {
      return ['high', 'medium', 'low'].includes(value);
    },
  },
});
const colorMapper = {
  high: 'aux-green-500',
  medium: 'aux-orange-500',
  low: 'aux-red-500',
};
</script>

<style lang="scss" scoped>
.quality-template-message-flag {
  display: flex;
  &__text {
    font-family: $unnnic-font-family-secondary;
    font-size: 14px;
    font-weight: $unnnic-font-weight-bold;
    line-height: 22px;
  }
  .info {
    margin-top: $unnnic-spacing-nano;
    margin-left: $unnnic-spacing-nano;
  }
  &--high {
    color: $unnnic-color-aux-green-500;
  }
  &--medium {
    color: $unnnic-color-aux-orange-500;
  }
  &--low {
    color: $unnnic-color-aux-red-500;
  }
}
</style>
