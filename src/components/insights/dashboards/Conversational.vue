<template>
  <section class="dashboard-conversational">
    <DashboardHeader class="dashboard-conversational__header" />

    <MostTalkedAboutTopicsWidget
      class="dashboard-conversational__most-talked-about-topics"
    />

    <ConversationalDynamicWidget
      v-for="(widget, index) in orderedDynamicWidgets"
      :key="index"
      :type="widget"
      class="dashboard-conversational__dynamic-widget"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DashboardHeader from '@/components/insights/conversations/DashboardHeader.vue';
import MostTalkedAboutTopicsWidget from '@/components/insights/conversations/MostTalkedAboutTopicsWidget/index.vue';
import ConversationalDynamicWidget from '@/components/insights/conversations/ConversationalDynamicWidget.vue';

type ConversationalWidgetType = 'csat' | 'nps' | 'add';

const dynamicWidgets = ref<ConversationalWidgetType[]>(['csat']);

const orderedDynamicWidgets = computed(() => {
  const widgets: ConversationalWidgetType[] = [];

  if (dynamicWidgets.value.includes('csat')) {
    widgets.push('csat');
  }

  if (dynamicWidgets.value.includes('nps')) {
    widgets.push('nps');
  }

  if (widgets.length < 2) {
    widgets.push('add');
  }

  return widgets;
});
</script>

<style lang="scss" scoped>
$layout-gap: $unnnic-spacing-sm;

.dashboard-conversational {
  display: flex;
  gap: $layout-gap;
  flex-wrap: wrap;

  &__header {
    width: 100%;
  }

  &__most-talked-about-topics {
    width: 100%;
  }

  &__dynamic-widget {
    min-width: calc(50% - $layout-gap / 2);
    width: fit-content;
  }
}
</style>
