<template>
  <component
    :is="currentComponent"
    v-bind="widgetProps"
    v-on="widgetEvents"
  />
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

import { formatSecondsToHumanString } from '@/utils/time';
import { currencySymbols } from '@/utils/currency';

import CardRecurrence from '@/components/insights/cards/CardRecurrence.vue';
import CardEmpty from '@/components/insights/cards/CardEmpty.vue';
import CardVtexOrder from '@/components/insights/cards/CardVtexOrder.vue';
import CardVtexConversions from '@/components/insights/cards/CardVtexConversions.vue';
import CardDashboard from '@/components/insights/cards/CardDashboard.vue';

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
  appliedFilters: {
    type: Object,
    default: () => ({}),
  },
});

const emits = defineEmits([
  'open-config',
  'clickData',
  'request-data',
  'redirect-to-expansive',
]);

const { t, locale } = useI18n();
const router = useRouter();

const dashboardsStore = useDashboards();

const { currentDashboard } = storeToRefs(dashboardsStore);

const currentComponent = computed(() => {
  const componentMap = {
    card: CardDashboard,
    empty_column: CardEmpty,
    vtex_order: CardVtexOrder,
    vtex_conversions: CardVtexConversions,
    recurrence: CardRecurrence,
  };

  return componentMap[props.widget.type] || null;
});

const getWidgetFormattedData = (widget) => {
  const { config, data } = widget;

  if (
    config?.operation === 'recurrence' ||
    config?.data_suffix === '%' ||
    config?.operation === 'percentage'
  ) {
    return (
      (data?.value || 0).toLocaleString(locale.value || 'en-US', {
        minimumFractionDigits: 2,
      }) + '%'
    );
  }
  if (config?.data_type === 'sec') {
    return formatSecondsToHumanString(Math.round(data?.value));
  }
  if (config?.currency) {
    return `${currencySymbols[currentDashboard.value.config?.currency_type]} ${Number(data?.value || 0).toLocaleString(locale.value || 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return (data?.value || 0).toLocaleString(locale.value || 'en-US');
};

const getHoverTooltipData = (widget) => {
  const isHumanServiceDashboard =
    currentDashboard.value.name === 'human_service_dashboard.title';

  if (isHumanServiceDashboard && widget.type === 'card') {
    const defaultTranslations = (key) => `human_service_dashboard.${key}`;

    const getTooltipTranslations = {
      in_progress: t('human_service_dashboard.tooltips.in_progress'),
      [defaultTranslations('response_time')]: t(
        'human_service_dashboard.tooltips.response_time',
      ),
      [defaultTranslations('interaction_time')]: t(
        'human_service_dashboard.tooltips.interaction_time',
      ),
      [defaultTranslations('waiting_time')]: t(
        'human_service_dashboard.tooltips.waiting_time',
      ),
      [defaultTranslations('awaiting_service')]: t(
        'human_service_dashboard.tooltips.awaiting_service',
      ),
      closeds: t('human_service_dashboard.tooltips.closeds'),
    };

    return getTooltipTranslations[widget.name] || '';
  }

  return '';
};

const widgetVtexData = computed(() => {
  if (props.widget.type === 'vtex_order' && props.widget.data) {
    const { total_value, average_ticket, orders } = props.widget.data;
    const existOrders = orders !== '';
    const existTotalValue = total_value !== '';
    const existAverageTicketValue = average_ticket !== '';
    const currentSymbol =
      currencySymbols[currentDashboard.value.config?.currency_type];

    const numbersNormalization = (value) =>
      `${currentSymbol} ${Number(value || 0).toLocaleString(locale.value || 'en-US', { minimumFractionDigits: 2 })}`;

    return {
      ...props.widget.data,
      orders: existOrders
        ? (orders || 0).toLocaleString(locale.value || 'en-US')
        : orders,
      total_value: existTotalValue
        ? numbersNormalization(total_value)
        : total_value,
      average_ticket: existAverageTicketValue
        ? numbersNormalization(average_ticket)
        : average_ticket,
    };
  }

  return null;
});

const widgetVtexConversionsData = computed(() => {
  if (props.widget.type === 'vtex_conversions' && props.widget.data) {
    const { utm_data, graph_data, error } = props.widget.data;
    return error
      ? { error }
      : {
          graph_data,
          utm_data: {
            ...utm_data,
            accumulated_total: getWidgetFormattedData({
              config: { currency: true },
              data: { value: utm_data.accumulated_total },
            }),
            medium_ticket: getWidgetFormattedData({
              config: { currency: true },
              data: { value: utm_data.medium_ticket },
            }),
          },
        };
  }
  return {};
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

const widgetProps = computed(() => {
  const { isLoading } = props;
  const { name, type, config, report, is_configurable } = props.widget;

  const defaultProps = {
    isLoading,
  };

  const mappingProps = {
    card: {
      metric: getWidgetFormattedData(props.widget),
      description: name,
      configured: !!name,
      clickable: !!report,
      configurable: is_configurable,
      friendlyId: config?.friendly_id,
      tooltip: config?.tooltip ? t(config.tooltip) : '',
      hoverTooltip: getHoverTooltipData(props.widget),
      id: props.widget.uuid,
    },
    empty_column: {
      widget: props.widget,
    },
    vtex_order: {
      widget: props.widget,
      data: widgetVtexData.value,
    },
    vtex_conversions: {
      widget: props.widget,
      data: widgetVtexConversionsData.value,
      isLoadingData: props.isRequestingData,
    },
    recurrence: {
      widget: props.widget,
      data: props.widget?.data || [],
      seeMore: !!report && props.widget?.data,
    },
  };

  return { ...defaultProps, ...mappingProps[type] };
});

const widgetEvents = computed(() => {
  const { type, uuid, config } = props.widget;

  const mappingEvents = {
    card: {
      click: () => redirectToReport(),
      openConfig: () => emits('open-config'),
    },
    empty_column: {
      openConfig: () => emits('open-config'),
    },
    vtex_order: {
      openConfig: () => emits('open-config'),
      requestData: () =>
        emits('request-data', { type: 'vtex_order', uuid, config }),
    },
    vtex_conversions: {
      openConfig: () => emits('open-config'),
    },
    recurrence: {
      openConfig: () => emits('open-config'),
      seeMore: () => redirectToReport(),
      requestData: () => emits('request-data', { type: 'recurrence', uuid }),
      clickData: (eventData) =>
        emits('clickData', {
          ...eventData,
          flow: {
            uuid: props.widget?.config?.flow?.uuid,
            result: props.widget?.config?.op_field,
          },
        }),
    },
  };

  return mappingEvents[type] || {};
});
</script>
