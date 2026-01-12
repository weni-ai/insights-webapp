<template>
  <section :class="['agent-card', { active: props.active }]">
    <section class="agent-card__container">
      <UnnnicChatsUserAvatar
        v-if="!props.hiddenAvatar"
        :username="props.title"
      />
      <section class="agent-card__agent">
        <section class="agent-card__agent-name-container">
          <p class="agent-card__agent-name">{{ props.title }}</p>
          <UnnnicToolTip
            v-if="props.tooltip"
            enabled
            :text="props.tooltip"
          >
            <UnnnicIcon
              icon="info"
              size="sm"
              filled
              scheme="neutral-cleanest"
            />
          </UnnnicToolTip>
        </section>
        <p class="agent-card__agent-subtitle">{{ props.subtitle }}</p>
      </section>
    </section>
    <p class="agent-card__rating">
      {{ formatNumber(props.rating, $i18n.locale) }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { formatNumber } from '@/utils/numbers';

defineOptions({
  name: 'AgentCard',
});

interface AgentCardProps {
  title: string;
  subtitle: string;
  tooltip?: string;
  rating?: number;
  hiddenAvatar?: boolean;
  active?: boolean;
}

const props = withDefaults(defineProps<AgentCardProps>(), {
  hiddenAvatar: false,
  tooltip: '',
  rating: undefined,
  active: false,
});
</script>

<style scoped lang="scss">
.agent-card {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: $unnnic-space-2;
  padding: $unnnic-space-2;
  justify-content: space-between;

  border-radius: $unnnic-spacing-xs;
  border: 1px solid $unnnic-color-border-soft;
  background: $unnnic-color-neutral-white;

  &.active {
    border: 1px solid $unnnic-color-border-active;
    background: $unnnic-color-teal-50;
  }

  &:hover:not(.active) {
    background: $unnnic-color-bg-soft;
  }

  &__container {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;

    :deep(.user-avatar) {
      background-color: $unnnic-color-neutral-white;
    }
  }

  &__agent {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;

    &-name {
      font: $unnnic-font-display-3;
      color: $unnnic-color-fg-emphasized;
      &-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: $unnnic-space-2;

        :deep(.unnnic-tooltip) {
          display: flex;
        }
      }
    }

    &-subtitle {
      font: $unnnic-font-body;
      color: $unnnic-color-fg-base;
    }
  }

  &__rating {
    font: $unnnic-font-display-3;
    color: $unnnic-color-fg-emphasized;
  }
}
</style>
