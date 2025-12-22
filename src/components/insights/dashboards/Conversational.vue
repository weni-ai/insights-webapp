<template>
  <section class="dashboard-conversational">
    <Info class="dashboard-conversational__info" />

    <DashboardHeader class="dashboard-conversational__header" />

    <MostTalkedAboutTopicsWidget
      class="dashboard-conversational__most-talked-about-topics"
    />

    <ConversationalDynamicWidget
      v-for="(widget, index) in orderedDynamicWidgets"
      :key="`${widget.type}-${widget.uuid || index}`"
      :type="widget.type"
      :uuid="widget.uuid"
      class="dashboard-conversational__dynamic-widget"
      :class="{
        'dashboard-conversational__dynamic-widget--only-add': isOnlyAddWidget(
          widget.type,
        ),
      }"
    />

    <CustomizableDrawer />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import DashboardHeader from '@/components/insights/conversations/DashboardHeader.vue';
import MostTalkedAboutTopicsWidget from '@/components/insights/conversations/MostTalkedAboutTopicsWidget/index.vue';
import ConversationalDynamicWidget from '@/components/insights/conversations/ConversationalDynamicWidget.vue';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useWidgets } from '@/store/modules/widgets';
import CustomizableDrawer from '@/components/insights/conversations/CustomizableWidget/CustomizableDrawer.vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import Info from '@/components/insights/conversations/Info.vue';

type ConversationalWidgetType =
  | 'csat'
  | 'nps'
  | 'add'
  | 'sales_funnel'
  | 'custom'
  | 'crosstab';

const customWidgets = useCustomWidgets();
const conversationalWidgets = useConversationalWidgets();
const widgets = useWidgets();

const { isLoadingCurrentDashboardWidgets, currentDashboardWidgets } =
  storeToRefs(widgets);

const dynamicWidgets = ref<{ type: ConversationalWidgetType; uuid: string }[]>(
  [],
);

const orderedDynamicWidgets = computed(() => {
  if (isLoadingCurrentDashboardWidgets.value) {
    return [];
  }

  return dynamicWidgets.value;
});

const isOnlyAddWidget = (widget: ConversationalWidgetType) => {
  const isOddNumberOfWidgets = dynamicWidgets.value.length % 2 === 1;
  const isLastWidgetAdd = widget === 'add';

  return isOddNumberOfWidgets && isLastWidgetAdd;
};

const setDynamicWidgets = () => {
  const newWidgets: { type: ConversationalWidgetType; uuid: string }[] = [];

  if (conversationalWidgets.isCsatConfigured) {
    newWidgets.push({ type: 'csat', uuid: '' });
  }

  if (conversationalWidgets.isNpsConfigured) {
    newWidgets.push({ type: 'nps', uuid: '' });
  }

  const customWidgetsList = customWidgets.getCustomWidgets;
  if (customWidgetsList.length > 0) {
    customWidgetsList.forEach((widget) => {
      newWidgets.push({
        type: (widget.type?.split('.')[1] as 'custom' | 'crosstab') || 'custom',
        uuid: widget.uuid,
      });
    });
  }

  if (conversationalWidgets.isSalesFunnelConfigured) {
    newWidgets.push({ type: 'sales_funnel', uuid: '' });
  }

  newWidgets.push({ type: 'add', uuid: '' });

  const hasChanged =
    dynamicWidgets.value.length !== newWidgets.length ||
    dynamicWidgets.value.some(
      (widget, index) =>
        widget.type !== newWidgets[index]?.type ||
        widget.uuid !== newWidgets[index]?.uuid,
    );

  if (hasChanged) {
    dynamicWidgets.value = newWidgets;
  }
};

watch(
  currentDashboardWidgets,
  () => {
    setDynamicWidgets();
  },
  { deep: true },
);

onMounted(() => {
  if (dynamicWidgets.value.length === 0) {
    setDynamicWidgets();
  }
});

onUnmounted(() => {
  dynamicWidgets.value = [];
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

    &--only-add {
      min-width: 100%;
    }
  }
}
</style>
