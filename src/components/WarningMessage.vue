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
  padding: $unnnic-space-4;
  align-items: center;
  gap: $unnnic-space-2;
  align-self: stretch;

  border-radius: $unnnic-radius-1;
  border: 1px solid $unnnic-color-gray-2;
  background: $unnnic-color-gray-1;

  &__title {
    color: $unnnic-color-gray-10;
    font-family: $unnnic-font-family;
    font-size: 14px;
    font-weight: $unnnic-font-weight-regular;
    line-height: 14px + 8px;
  }
}
</style>
