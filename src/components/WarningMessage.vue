<template>
  <section class="warning-message">
    <UnnnicIcon
      icon="alert-circle-1"
      size="ant"
      scheme="feedback-yellow"
      filled
      next
    />
    <p class="warning-message__title">
      {{ title }}
    </p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped lang="scss">
.warning-message {
  display: flex;
  padding: $unnnic-spacing-sm;
  align-items: center;
  gap: $unnnic-spacing-xs;
  align-self: stretch;

  border-radius: $unnnic-border-radius-sm;
  border: 1px solid $unnnic-color-neutral-soft;
  background: $unnnic-color-background-carpet;

  &__title {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
