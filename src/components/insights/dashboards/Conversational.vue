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
      :class="{
        'dashboard-conversational__dynamic-widget--only-add':
          isOnlyAddWidget(widget),
      }"
    />

    <CustomizableDrawer />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import DashboardHeader from '@/components/insights/conversations/DashboardHeader.vue';
import MostTalkedAboutTopicsWidget from '@/components/insights/conversations/MostTalkedAboutTopicsWidget/index.vue';
import ConversationalDynamicWidget from '@/components/insights/conversations/ConversationalDynamicWidget.vue';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useWidgets } from '@/store/modules/widgets';
import CustomizableDrawer from '@/components/insights/conversations/CustomizableWidget/CustomizableDrawer.vue';

type ConversationalWidgetType = 'csat' | 'nps' | 'add';

const conversationalWidgets = useConversationalWidgets();
const { isCsatConfigured, isNpsConfigured, getDynamicWidgets } = storeToRefs(
  conversationalWidgets,
);
const widgets = useWidgets();
const { isLoadingCurrentDashboardWidgets } = storeToRefs(widgets);

const dynamicWidgets = computed(() => {
  const widgets: ConversationalWidgetType[] = [];

  if (isCsatConfigured.value) {
    widgets.push('csat');
  }

  if (isNpsConfigured.value) {
    widgets.push('nps');
  }

  widgets.push('add');

  return widgets;
});

const orderedDynamicWidgets = computed(() => {
  const widgets: ConversationalWidgetType[] = [];

  if (isLoadingCurrentDashboardWidgets.value) {
    return [];
  }

  if (dynamicWidgets.value.includes('csat')) {
    widgets.push('csat');
  }

  if (dynamicWidgets.value.includes('nps')) {
    widgets.push('nps');
  }

  if (dynamicWidgets.value.includes('add')) {
    widgets.push('add');
  }

  return widgets;
});

const isOnlyAddWidget = (widget: ConversationalWidgetType) => {
  const isOddNumberOfWidgets = orderedDynamicWidgets.value.length % 2 === 1;
  const isLastWidgetAdd = widget === 'add';

  return isOddNumberOfWidgets && isLastWidgetAdd;
};
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

    &--only-add {
      min-width: 100%;
    }
  }
}
</style>
