<template>
  <component
    :is="currentComponent"
    v-bind="widgetProps"
    :data-testid="`dynamic-graph-${widget.type}`"
    v-on="widgetEvents"
  />
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

import LineChart from '@/components/insights/charts/LineChart.vue';
import HorizontalBarChart from '@/components/insights/charts/HorizontalBarChart.vue';
import CardFunnel from '@/components/insights/cards/CardFunnel.vue';

const props = defineProps({
  widget: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isRequestingData: {
    type: Boolean,
    default: false,
  },
  hasError: {
    type: Boolean,
    default: false,
  },
  isConfigured: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['open-config', 'clickData', 'request-data']);

const { t } = useI18n();
const router = useRouter();

const dashboardsStore = useDashboards();

const { currentDashboard } = storeToRefs(dashboardsStore);

const currentComponent = computed(() => {
  const componentMap = {
    graph_column: LineChart,
    graph_bar: HorizontalBarChart,
    graph_funnel: CardFunnel,
  };

  return componentMap[props.widget.type] || null;
});

const widgetGraphData = computed(() => {
  if (
    !props.widget.type.includes('graph') ||
    props.widget.type === 'graph_funnel' ||
    !props.widget.data
  ) {
    return;
  }

  const widgetData = props.widget.data;
  const data = widgetData.data || widgetData.results;

  const labels = data.map((item) => item.label);
  const values = data.map((item) => item.value);
  const fullValues = data.map((item) => item.full_value);

  const newData = {
    labels,
    datasets: [
      {
        data: values,
        fullValues,
      },
    ],
  };

  return newData;
});

const widgetProps = computed(() => {
  const { isLoading } = props;
  const { name, data, type, config, report, is_configurable } = props.widget;

  const defaultProps = {
    isLoading,
  };

  const mappingProps = {
    graph_column: {
      title: t(name),
      chartData: widgetGraphData.value || {},
      seeMore: !!report,
    },
    graph_bar: {
      title: t(name),
      chartData: widgetGraphData.value || {},
      datalabelsSuffix: config?.data_suffix,
      seeMore: !!report,
    },
    graph_funnel: {
      widget: props.widget,
      chartData: data || [],
      configurable: is_configurable,
      configured: props.isConfigured,
      hasError: props.hasError,
      isLoading: props.isRequestingData,
    },
  };

  return { ...defaultProps, ...mappingProps[type] };
});

const redirectToReport = () => {
  const { uuid, report } = props.widget;
  if (!report) {
    return;
  }

  switch (report.type) {
    case 'internal':
      router.push({
        name: 'report',
        params: {
          dashboardUuid: currentDashboard.value.uuid,
          widgetUuid: uuid,
        },
        query: {
          ...router.currentRoute.value.query,
        },
      });
      break;

    case 'external':
      window.open(report.url, '_blank');
      break;

    default:
      break;
  }
};

const widgetEvents = computed(() => {
  const { type, uuid, config } = props.widget;

  const mappingEvents = {
    graph_column: {
      seeMore: () => redirectToReport(),
    },
    graph_bar: {
      clickData: (eventData) =>
        emits('clickData', {
          ...eventData,
          flow: {
            uuid:
              props.widget?.config?.flow?.uuid ||
              props.widget.config?.filter?.flow,
            result: props.widget?.config?.op_field,
          },
        }),
    },
    graph_funnel: {
      openConfig: () => emits('open-config'),
      requestData: () => emits('request-data', { uuid, config }),
    },
  };

  return mappingEvents[type] || {};
});
</script>
