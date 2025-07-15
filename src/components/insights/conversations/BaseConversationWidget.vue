<template>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    class="base-conversation-widget__skeleton"
    :width="`100%`"
    height="450px"
    data-testid="progress-widget-skeleton"
  />

  <section
    v-else
    class="base-conversation-widget"
    v-bind="$attrs"
    data-testid="progress-widget"
  >
    <section
      class="base-conversation-widget__header"
      data-testid="progress-widget-header"
    >
      <p
        class="header__title"
        data-testid="progress-widget-title"
      >
        {{ title }}
      </p>
      <section
        class="header__actions"
        data-testid="progress-widget-actions"
      >
        <ShortTab
          :tabs="tabs"
          data-testid="progress-widget-tabs"
          @tab-change="handleTabChange"
        />
        <slot name="actions" />
      </section>
    </section>
    <slot />
  </section>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import ShortTab from '@/components/ShortTab.vue';
import i18n from '@/utils/plugins/i18n';

const emit = defineEmits<{
  (_event: 'tab-change', _tab: string): void;
}>();

defineProps<{
  title: string;
  isLoading?: boolean;
}>();

const tabs = computed(() => [
  {
    name: i18n.global.t('conversations_dashboard.artificial_intelligence'),
    key: 'intelligence-artificial',
  },
  {
    name: i18n.global.t('conversations_dashboard.human_support'),
    key: 'human-support',
  },
]);

const handleTabChange = (tab: string) => {
  emit('tab-change', tab);
};
</script>

<style scoped lang="scss">
.base-conversation-widget {
  width: 100%;
  display: flex;
  padding: $unnnic-spacing-md;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
  flex: 1 0 0;
  align-self: stretch;

  border-radius: $unnnic-spacing-xs;
  border: 1px solid $unnnic-color-neutral-soft;
  background: $unnnic-color-neutral-white;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header__title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
      font-style: normal;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    }
  }
}
</style>
