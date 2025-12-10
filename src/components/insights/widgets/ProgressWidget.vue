<template>
  <BaseConversationWidget
    :title="title"
    :actions="actions"
    :isLoading="isLoading"
    :currentTab="currentTab"
    :isOnlyTab="isOnlyTab"
    :hiddenTabs="['sales_funnel', 'crosstab'].includes(type)"
    @tab-change="handleTabChange"
  >
    <SalesFunnelWidget v-if="type === 'sales_funnel' && !isError" />
    <CrosstabWidget
      v-else-if="type === 'crosstab' && !isError"
      :widgetUuid="props.uuid"
    />
    <slot
      v-else-if="treatedProgressItems?.length === 0"
      name="setup-widget"
    />
    <template v-else-if="!isError">
      <WarningMessage
        v-if="isWarningMessage"
        :title="$t('conversations_dashboard.no_data_available')"
      />
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
        v-if="(footerText || isExpanded) && !isLoadingProgress"
        :class="[
          'progress-widget__footer',
          footerText
            ? 'progress-widget__footer-content-start'
            : 'progress-widget__footer-content-center',
        ]"
        data-testid="progress-widget-footer"
      >
        <p
          v-if="footerText"
          class="footer__text"
          data-testid="progress-widget-footer-text"
        >
          {{ footerText }}
        </p>
        <UnnnicButton
          v-if="isExpanded"
          class="progress-widget__footer-button"
          data-testid="progress-widget-footer-button"
          :text="$t('see_more')"
          type="tertiary"
          @click.stop="$emit('open-expanded')"
        />
      </section>
      <UnnnicSkeletonLoading
        v-if="isLoadingProgress"
        class="progress-widget__skeleton"
        data-testid="progress-widget-skeleton"
        width="80px"
        height="22px"
      />
    </template>
    <template v-else>
      <WidgetError
        :title="actionError?.title"
        :description="actionError?.description"
        :buttonText="actionError?.buttonText"
        @click="actionError?.onClick"
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
import WarningMessage from '@/components/WarningMessage.vue';
import WidgetError from '@/components/insights/conversations/WidgetError.vue';
import SalesFunnelWidget from '@/components/insights/widgets/SalesFunnelWidget.vue';
import CrosstabWidget from './CrosstabWidget.vue';

const emit = defineEmits<{
  'tab-change': [tab: Tab];
  'open-expanded': [];
}>();

const props = defineProps<{
  uuid?: string;
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
  isExpanded?: boolean;
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
  isError?: boolean;
  actionError?: {
    title: string;
    buttonText: string;
    description?: string;
    onClick: () => void;
  };
  type?: 'csat' | 'nps' | 'sales_funnel' | 'custom' | 'add' | 'crosstab';
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

const isWarningMessage = computed(() => {
  if (!treatedProgressItems.value?.length) return false;

  const isAllValuesZero = treatedProgressItems.value.every(
    (item) => item?.value === 0,
  );

  return !props.isLoadingProgress && isAllValuesZero;
});
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
    align-items: center;

    &-content-start {
      justify-content: flex-start;
    }
    &-content-center {
      justify-content: center;
    }

    .footer__text {
      color: $unnnic-color-neutral-clean;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      font-weight: $unnnic-font-weight-regular;
      font-style: normal;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }

    &-button {
      width: 100%;
    }
  }

  &__skeleton-container {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;
  }
}
</style>
