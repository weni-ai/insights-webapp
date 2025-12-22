<template>
  <section
    class="dashboard-conversational__info"
    data-testid="info-section"
  >
    <UnnnicIcon
      icon="info"
      size="sm"
      scheme="feedback-blue"
      data-testid="info-icon"
    />
    <p
      class="dashboard-conversational__info__description"
      data-testid="info-description"
    >
      {{ $t('conversations_dashboard.info.description') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { UnnnicIcon } from '@weni/unnnic-system';
</script>

<style scoped lang="scss">
.dashboard-conversational__info {
  display: flex;
  align-items: center;
  padding: $unnnic-space-4;
  gap: $unnnic-space-2;
  align-self: stretch;
  width: 100%;

  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-border-info;
  background: $unnnic-color-bg-info;

  &__description {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-fg-emphasized;
  }
}
</style>
