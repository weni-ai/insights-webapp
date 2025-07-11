<template>
  <section
    v-if="showProgressWidget"
    class="progress-widget"
    data-testid="progress-widget"
  >
    <section
      class="progress-widget__header"
      data-testid="progress-widget-header"
    >
      <p
        class="progress-widget__header-title"
        data-testid="progress-widget-title"
      >
        {{ title }}
      </p>
      <div
        class="progress-widget__header__actions"
        data-testid="progress-widget-actions"
      >
        <ShortTab
          :tabs="tabs"
          data-testid="progress-widget-tabs"
          @tab-change="handleTabChange"
        />
      </div>
    </section>
    <section
      class="progress-widget__content"
      data-testid="progress-widget-content"
    >
      <section
        v-if="card"
        class="progress-widget__content__card"
        data-testid="progress-widget-card"
      >
        <CardConversations
          :title="card.title"
          :value="card.value"
          :valueDescription="card.valueDescription"
          :tooltipInfo="card.tooltipInfo"
          :isLoading="card.isLoading"
        />
      </section>
      <ProgressItem
        v-for="item in progressItems"
        :key="item.text"
        :text="item.text"
        :value="item.value"
        :backgroundColor="item.backgroundColor"
        :color="item.color"
        data-testid="progress-widget-progress-item"
      />
    </section>
    <section
      v-if="footerText"
      class="progress-widget__footer"
      data-testid="progress-widget-footer"
    >
      <p
        class="progress-widget__footer-text"
        data-testid="progress-widget-footer-text"
      >
        {{ footerText }}
      </p>
    </section>
  </section>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    class="progress-widget__skeleton"
    :width="`100%`"
    height="450px"
    data-testid="progress-widget-skeleton"
  />
</template>

<script setup lang="ts">
import ProgressItem from '@/components/ProgressItem.vue';
import { defineProps, computed } from 'vue';
import CardConversations from '@/components/insights/cards/CardConversations.vue';
import ShortTab from '@/components/ShortTab.vue';

const emit = defineEmits<{
  (_e: 'tabChange', tab: string): void;
}>();

const props = defineProps<{
  title: string;
  card?: {
    title: string;
    value: string;
    valueDescription: string;
    tooltipInfo: string;
    isLoading: boolean;
  };
  progressItems: {
    text: string;
    value: number;
    backgroundColor?: string;
    color?: string;
  }[];
  footerText?: string;
  isLoading?: boolean;
}>();

const tabs = computed(() => [
  {
    name: 'IA',
    key: 'intelligence-artificial',
  },
  {
    name: 'Human support',
    key: 'human-support',
  },
]);

const showProgressWidget = computed(() => {
  return !props.isLoading;
});

const handleTabChange = (tab: string) => {
  emit('tabChange', tab);
};
</script>

<style scoped lang="scss">
.progress-widget {
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

    &-title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
      font-style: normal;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    }
  }

  &__content {
    &__card {
      padding-bottom: $unnnic-spacing-sm;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    &-text {
      color: $unnnic-color-neutral-clean;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      font-weight: $unnnic-font-weight-regular;
      font-style: normal;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }
  }
}
</style>
