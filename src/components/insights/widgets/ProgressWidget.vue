<template>
  <BaseConversationWidget
    :title="title"
    :actions="actions"
    :isLoading="isLoading"
    :currentTab="currentTab"
    :isOnlyTab="isOnlyTab"
    @tab-change="handleTabChange"
  >
    <slot
      v-if="treatedProgressItems?.length === 0"
      name="setup-widget"
    />
    <template v-else>
      <section
        class="progress-widget__content"
        data-testid="progress-widget-content"
      >
        <section
          v-if="card"
          class="content__card"
          data-testid="progress-widget-card"
        >
          <CardConversations
            :title="card.title"
            :value="card.value"
            :valueDescription="card.valueDescription"
            :tooltipInfo="card.tooltipInfo"
            :tooltipSide="'left'"
            :isLoading="card.isLoading"
          />
        </section>

        <ProgressTable
          v-if="treatedProgressItems?.length > 0 && !isLoadingProgress"
          :progressItems="treatedProgressItems"
          data-testid="progress-widget-table"
        />
        <section
          v-if="isLoadingProgress"
          class="progress-widget__skeleton-container"
        >
          <UnnnicSkeletonLoading
            v-for="index in card ? 3 : 5"
            :key="index"
            class="progress-widget__skeleton"
            data-testid="progress-widget-skeleton"
            width="100%"
            height="56px"
          />
        </section>
      </section>
      <section
        v-if="footerText && !isLoadingProgress"
        class="progress-widget__footer"
        data-testid="progress-widget-footer"
      >
        <p
          class="footer__text"
          data-testid="progress-widget-footer-text"
        >
          {{ footerText }}
        </p>
      </section>
      <UnnnicSkeletonLoading
        v-if="isLoadingProgress"
        class="progress-widget__skeleton"
        data-testid="progress-widget-skeleton"
        width="80px"
        height="22px"
      />
    </template>
  </BaseConversationWidget>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
import BaseConversationWidget, {
  Tab,
} from '@/components/insights/conversations/BaseConversationWidget.vue';
import CardConversations from '@/components/insights/cards/CardConversations.vue';
import ProgressTable from '@/components/ProgressTable.vue';

const emit = defineEmits<{
  (e: 'tab-change', tab: Tab): void;
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
  isLoadingProgress?: boolean;
  actions?: {
    icon: string;
    text: string;
    onClick: () => void;
    scheme?: string;
  }[];
  currentTab?: string;
  isOnlyTab?: boolean;
}>();

const treatedProgressItems = computed(() => {
  return props.progressItems?.map((item) => ({
    label: item.text,
    description: `${item.value}%`,
    value: item.value,
    backgroundColor: item.backgroundColor,
    color: item.color,
  }));
});

const handleTabChange = (tab: Tab) => {
  emit('tab-change', tab);
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
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  background: $unnnic-color-neutral-white;

  &__content {
    .content__card {
      display: flex;
      min-height: calc(114px + $unnnic-spacing-sm);
      padding-bottom: $unnnic-spacing-sm;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .footer__text {
      color: $unnnic-color-neutral-clean;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      font-weight: $unnnic-font-weight-regular;
      font-style: normal;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }
  }

  &__skeleton-container {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
  }
}
</style>
