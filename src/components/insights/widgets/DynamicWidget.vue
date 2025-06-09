<template>
  <component
    :is="currentComponent"
    v-bind="componentProps"
    v-on="componentEvents"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';
import { useReports } from '@/store/modules/reports';

import { useWidgetTypes } from '@/composables/useWidgetTypes';

import DynamicCard from './DynamicCard.vue';
import DynamicGraph from './DynamicGraph.vue';
import DynamicTable from './DynamicTable.vue';

const props = defineProps({
  widget: {
    type: Object,
    required: true,
  },
});

const emits = defineEmits(['open-config', 'clickData']);

const route = useRoute();

const dashboardsStore = useDashboards();
const widgetsStore = useWidgets();
const reportsStore = useReports();

const { appliedFilters, currentDashboard } = storeToRefs(dashboardsStore);

const { getWidgetCategory } = useWidgetTypes();

const interval = ref(null);
const isRequestingData = ref(false);
const hasError = ref(false);

const isHumanServiceDashboard = computed(() => {
  return currentDashboard.value?.name === 'human_service_dashboard.title';
});

const hasDateFiltering = computed(() => {
  return 'created_on' in appliedFilters.value;
});

const isConfigured = computed(() => {
  const { config } = props.widget;
  return !!(config && Object.keys(config).length > 0);
});

const isLoading = computed(() => {
  return (
    isConfigured.value && (!('data' in props.widget) || isRequestingData.value)
  );
});

// getWidgetCategory function is now provided by useWidgetTypes composable

const currentComponent = computed(() => {
  const category = getWidgetCategory(props.widget.type);

  const componentMap = {
    graph: DynamicGraph,
    card: DynamicCard,
    table: DynamicTable,
  };

  return componentMap[category] || null;
});

const componentProps = computed(() => {
  return {
    widget: props.widget,
    isLoading: isLoading.value,
    isRequestingData: isRequestingData.value,
    hasError: hasError.value,
    isConfigured: isConfigured.value,
    appliedFilters: appliedFilters.value,
  };
});

const requestWidgetData = async ({ offset, limit, next, silence } = {}) => {
  try {
    if (!silence) isRequestingData.value = true;

    if (route.name === 'report') {
      await reportsStore.getWidgetReportData({ offset, limit, next });
    } else if (isConfigured.value) {
      await widgetsStore.getCurrentDashboardWidgetData(props.widget);
      if (!silence) dashboardsStore.updateLastUpdatedRequest();
    }
  } catch (e) {
    console.error('requestWidgetData error', e);
  } finally {
    isRequestingData.value = false;
  }
};

const handleRequestData = async (requestParams) => {
  try {
    isRequestingData.value = true;
    hasError.value = false;

    if (requestParams.type === 'vtex_order') {
      await widgetsStore.getWidgetVtexOrderData({
        uuid: requestParams.uuid,
        utm_source: requestParams.config.filter.utm,
      });
    } else if (requestParams.type === 'recurrence') {
      await widgetsStore.getWidgetRecurrenceData({
        uuid: requestParams.uuid,
      });
    } else if (requestParams.uuid && requestParams.config) {
      await widgetsStore.getWidgetGraphFunnelData({
        uuid: requestParams.uuid,
        widgetFunnelConfig: requestParams.config,
      });
    } else {
      await requestWidgetData(requestParams);
    }
  } catch (error) {
    hasError.value = true;
    console.error('handleRequestData error', error);
  } finally {
    isRequestingData.value = false;
  }
};

const redirectToTableAgents = (widget) => {
  widgetsStore.updateCurrentExpansiveWidgetData(widget);
};

const componentEvents = computed(() => {
  return {
    'open-config': () => emits('open-config'),
    clickData: (eventData) => emits('clickData', eventData),
    'request-data': handleRequestData,
    'redirect-to-expansive': redirectToTableAgents,
  };
});

const initRequestDataInterval = () => {
  const ONE_MINUTE = 1000 * 60;

  if (isHumanServiceDashboard.value && !hasDateFiltering.value) {
    interval.value = setInterval(() => {
      requestWidgetData({ silence: true });
      dashboardsStore.updateLastUpdatedRequest();
    }, ONE_MINUTE);
  }
};

watch(
  () => route.query,
  () => {
    if (
      ![
        'table_group',
        'graph_funnel',
        'empty_column',
        'vtex_order',
        'recurrence',
      ].includes(props.widget.type)
    ) {
      requestWidgetData();
    }
  },
  { immediate: true },
);

watch(hasDateFiltering, (newHasDateFiltering) => {
  clearInterval(interval.value);

  if (!newHasDateFiltering && isHumanServiceDashboard.value) {
    initRequestDataInterval();
  }
});

onMounted(() => {
  if (!hasDateFiltering.value && isHumanServiceDashboard.value) {
    initRequestDataInterval();
  }
});

onUnmounted(() => {
  clearInterval(interval.value);
});
</script>
