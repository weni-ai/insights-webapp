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
import { useConfig } from '@/store/modules/config';

import { useWidgetTypes } from '@/composables/useWidgetTypes';

import DynamicCard from './DynamicCard.vue';
import DynamicGraph from './DynamicGraph.vue';
import DynamicTable from './DynamicTable.vue';

import Unnnic from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';

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
const configStore = useConfig();

const { appliedFilters, currentDashboard } = storeToRefs(dashboardsStore);
const { isActiveRoute } = storeToRefs(configStore);

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
      try {
        await reportsStore.getWidgetReportData({ offset, limit, next });
      } catch (error) {
        Unnnic.unnnicCallAlert({
          props: {
            text: i18n.global.t('get_data_error'),
            type: 'error',
          },
        });
      }
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

    if (requestParams?.type === 'vtex_order') {
      await widgetsStore.getWidgetVtexOrderData({
        uuid: requestParams.uuid,
        utm_source: requestParams.config?.filter?.utm,
      });
    } else if (requestParams?.type === 'recurrence') {
      await widgetsStore.getWidgetRecurrenceData({
        uuid: requestParams.uuid,
      });
    } else if (requestParams?.uuid && requestParams?.config) {
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
      const params = {
        silence: true,
        limit: route.query.limit,
        offset: route.query.offset,
      };
      requestWidgetData(params);
      dashboardsStore.updateLastUpdatedRequest();
    }, ONE_MINUTE);
  }
};

const stopRequestDataInterval = () => {
  if (interval.value) {
    clearInterval(interval.value);
    interval.value = null;
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
  stopRequestDataInterval();

  if (!newHasDateFiltering && isHumanServiceDashboard.value) {
    initRequestDataInterval();
  }
});

watch(isActiveRoute, (newValue) => {
  if (newValue && !interval.value) {
    initRequestDataInterval();
  } else if (!newValue) {
    stopRequestDataInterval();
  }
});

onMounted(() => {
  if (isHumanServiceDashboard.value && !hasDateFiltering.value) {
    initRequestDataInterval();
  }
});

onUnmounted(() => {
  stopRequestDataInterval();
});
</script>
