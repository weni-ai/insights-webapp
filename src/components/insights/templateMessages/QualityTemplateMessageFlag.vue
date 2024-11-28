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
    <p class="">
      {{ $t('active') }} -
      {{ $t(`template_messages_dashboard.quality.${quality}`) }}
    </p>
    <UnnnicToolTip
      v-if="props.showInfo"
      class="info"
      enabled
      :text="`Learn more through Meta's documentation`"
    >
      <UnnnicIcon
        icon="info"
        :scheme="colorMapper[props.quality]"
        size="sm"
      />
    </UnnnicToolTip>
  </section>
</template>

<script lang="ts">
export default { name: 'QualityTemplateMessageFlag' };
</script>

<script lang="ts" setup>
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
    validate: (value: string) => {
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
