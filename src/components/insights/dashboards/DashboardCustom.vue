<template>
  <section
    class="dashboard"
    :style="dashboardGridStyle"
  >
    <section
      v-if="isLoadingCurrentDashboardWidgets"
      class="dashboard__loading"
    >
      <IconLoading />
    </section>
    <template
      v-for="widget of currentDashboardWidgets"
      v-else
      :key="widget.uuid"
    >
      <DynamicWidget
        :style="getWidgetStyle(widget.grid_position)"
        :widget="widget"
        :data-onboarding-id="getWidgetOnboardingId(widget)"
        @open-config="handlerWidgetOpenConfig(widget)"
        @click-data="openFlowResultContactList"
      />
    </template>

    <DrawerConfigGallery
      v-if="!!currentWidgetEditing"
      :modelValue="!!currentWidgetEditing"
      @close="widgetsStore.updateCurrentWidgetEditing(null)"
    />
    <FlowResultContactListModal
      v-if="showFlowResultsContactListModal"
      :flowResultLabel="flowResultsContactListParams?.label"
      :flow="flowResultsContactListParams?.flow"
      @close="closeFlowResultContactList()"
    />
  </section>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';
import { useOnboarding } from '@/store/modules/onboarding';

import DrawerConfigGallery from '@/components/insights/drawers/DrawerConfigGallery/index.vue';
import IconLoading from '@/components/IconLoading.vue';
import FlowResultContactListModal from '@/components/FlowResultContactListModal.vue';
import { moduleStorage } from '@/utils/storage';

defineOptions({ name: 'DashboardCustom' });

const DynamicWidget = defineAsyncComponent(
  () => import('@/components/insights/widgets/DynamicWidget.vue'),
);

const dashboardsStore = useDashboards();
const widgetsStore = useWidgets();
const onboardingStore = useOnboarding();

const { currentDashboard } = storeToRefs(dashboardsStore);
const {
  currentDashboardWidgets,
  currentWidgetEditing,
  isLoadingCurrentDashboardWidgets,
} = storeToRefs(widgetsStore);
const { showConfigWidgetOnboarding } = storeToRefs(onboardingStore);

const showDrawerConfigWidget = ref(false);
const widgetConfigurating = ref<any>(null);
const showOnboarding = ref({
  card: false,
  empty_widget: false,
});
const showFlowResultsContactListModal = ref(false);
const flowResultsContactListParams = ref<any>(null);

const isCustomDashboard = computed(() => {
  return currentDashboard.value.is_deletable;
});

const dashboardGridStyle = computed(() => {
  const { grid } = currentDashboard.value || {};
  if (grid) {
    return {
      gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
      gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
    };
  }
  return {};
});

watch(
  currentDashboardWidgets,
  (newCurrentDashboardWidgets) => {
    if (
      !!newCurrentDashboardWidgets &&
      isCustomDashboard.value &&
      !isLoadingCurrentDashboardWidgets.value
    ) {
      handlerWidgetsOnboarding();
    }
  },
  { immediate: true },
);

function openFlowResultContactList(data: any) {
  flowResultsContactListParams.value = data;
  showFlowResultsContactListModal.value = true;
}

function closeFlowResultContactList() {
  flowResultsContactListParams.value = {};
  showFlowResultsContactListModal.value = false;
}

function handleWidgetFilledData() {
  const hasCard = currentDashboardWidgets.value.filter(
    (e: any) => e.type === 'card',
  );

  const existFunnel = currentDashboardWidgets.value.some(
    (e: any) => e.type === 'graph_funnel',
  );
  const existVtex = currentDashboardWidgets.value.some(
    (e: any) => e.type === 'vtex_order',
  );

  showOnboarding.value = {
    card:
      hasCard.length > 0
        ? !!hasCard.every((widget: any) => widget.name === '')
        : false,
    empty_widget:
      !!currentDashboardWidgets.value.some(
        (widget: any) => widget.type === 'empty_column',
      ) &&
      !existFunnel &&
      !existVtex,
  };
}

function handlerWidgetsOnboarding() {
  const hasWidgetsOnboardingComplete =
    moduleStorage.getItem('hasWidgetsOnboardingComplete') === true;

  if (!hasWidgetsOnboardingComplete) {
    handleWidgetFilledData();

    if (!showOnboarding.value.card && !showOnboarding.value.empty_widget) {
      moduleStorage.setItem('hasWidgetsOnboardingComplete', true);
    }

    if (showOnboarding.value.card || showOnboarding.value.empty_widget) {
      onboardingStore.setShowConfigWidgetsOnboarding(true);
    }
  }
}

function handlerWidgetOpenConfig(widget: any) {
  const isNewWidget = currentWidgetEditing.value?.uuid !== widget.uuid;
  if (isNewWidget) {
    widgetsStore.updateCurrentWidgetEditing(widget)?.then(() => {
      onboardingStore.callTourNextStep('widgets-onboarding-tour');
    });
  }
}

function getWidgetStyle(gridPosition: any) {
  return {
    gridColumn: `${gridPosition.column_start} / ${gridPosition.column_end + 1}`,
    gridRow: `${gridPosition.row_start} / ${gridPosition.row_end + 1}`,
  };
}

function getWidgetOnboardingId(widget: any) {
  return widget.type === 'card' ? 'widget-card-metric' : 'widget-graph-empty';
}

defineExpose({
  showDrawerConfigWidget,
  widgetConfigurating,
  showOnboarding,
  showFlowResultsContactListModal,
  flowResultsContactListParams,
  isCustomDashboard,
  dashboardGridStyle,
  openFlowResultContactList,
  closeFlowResultContactList,
  handleWidgetFilledData,
  handlerWidgetsOnboarding,
  handlerWidgetOpenConfig,
  getWidgetStyle,
  getWidgetOnboardingId,
});
</script>

<style lang="scss" scoped>
.dashboard {
  overflow: hidden;

  height: 100%;

  display: grid;
  gap: $unnnic-space-4;
  &__loading {
    width: 100vw;
    height: 85vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
