<template>
  <component
    :is="currentComponent"
    v-bind="widgetProps"
    :data-testid="`dynamic-card-${widget.type}`"
    v-on="widgetEvents"
  />
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';

import { useWidgetNavigation } from '@/composables/useWidgetNavigation';
import { useWidgetFormatting } from '@/composables/useWidgetFormatting';

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

const { t } = useI18n();

const { redirectToReport } = useWidgetNavigation();
const { getWidgetFormattedData, getHoverTooltipData, formatVtexData } =
  useWidgetFormatting();

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

// Functions are now provided by useWidgetFormatting composable

const widgetVtexData = computed(() => {
  if (props.widget.type === 'vtex_order' && props.widget.data) {
    return formatVtexData(props.widget.data);
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

// redirectToReport function is now provided by useWidgetNavigation composable

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
      click: () => redirectToReport(props.widget),
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
      seeMore: () => redirectToReport(props.widget),
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
