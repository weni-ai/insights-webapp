<template>
  <BaseConversationWidget
    :isLoading="isLoading"
    :title="title"
  >
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
      <ProgressItem
        v-for="item in progressItems"
        :key="item.text"
        :text="item.text"
        :value="item.value"
        :backgroundColor="item.backgroundColor"
        :progressColor="item.color"
        data-testid="progress-widget-progress-item"
      />
    </section>
    <section
      v-if="footerText"
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
  </BaseConversationWidget>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
import CardConversations from '@/components/insights/cards/CardConversations.vue';
import ProgressItem from '@/components/ProgressItem.vue';

defineProps<{
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
}
</style>
