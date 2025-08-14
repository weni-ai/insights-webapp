<template>
  <section class="dashboard-conversational">
    <DashboardHeader class="dashboard-conversational__header" />

    <MostTalkedAboutTopicsWidget
      class="dashboard-conversational__most-talked-about-topics"
    />

    <ConversationalDynamicWidget
      v-for="(widget, index) in orderedDynamicWidgets"
      :key="index"
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
import { computed, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import DashboardHeader from '@/components/insights/conversations/DashboardHeader.vue';
import MostTalkedAboutTopicsWidget from '@/components/insights/conversations/MostTalkedAboutTopicsWidget/index.vue';
import ConversationalDynamicWidget from '@/components/insights/conversations/ConversationalDynamicWidget.vue';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useWidgets } from '@/store/modules/widgets';
import CustomizableDrawer from '@/components/insights/conversations/CustomizableWidget/CustomizableDrawer.vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';

type ConversationalWidgetType = 'csat' | 'nps' | 'add' | 'custom';

const customWidgets = useCustomWidgets();
const { getCustomWidgets } = storeToRefs(customWidgets);

const conversationalWidgets = useConversationalWidgets();
const { isCsatConfigured, isNpsConfigured, getDynamicWidgets } = storeToRefs(
  conversationalWidgets,
);
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

watch(currentDashboardWidgets, () => {
  if (isCsatConfigured.value) {
    dynamicWidgets.value.push({ type: 'csat', uuid: '' });
  }

  if (isNpsConfigured.value) {
    dynamicWidgets.value.push({ type: 'nps', uuid: '' });
  }

  if (getCustomWidgets.value.length > 0) {
    getCustomWidgets.value.forEach((widget) => {
      dynamicWidgets.value.push({ type: 'custom', uuid: widget.uuid });
    });
  }

  dynamicWidgets.value.push({ type: 'add', uuid: '' });
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
