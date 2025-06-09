<template>
  <component
    :is="currentComponent"
    v-bind="widgetProps"
    :data-testid="`dynamic-table-${widget.type}`"
    v-on="widgetEvents"
  />
</template>

<script setup>
import { computed, defineEmits, defineProps } from 'vue';

import TableHumanServiceAgents from './HumanServiceAgentsTable/index.vue';
import TableGroup from '@/components/insights/widgets/TableGroup.vue';

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

const currentComponent = computed(() => {
  const componentMap = {
    table_dynamic_by_filter: TableHumanServiceAgents,
    table_group: TableGroup,
  };

  return componentMap[props.widget.type] || null;
});

const widgetProps = computed(() => {
  const { isLoading } = props;
  const { name, data, type, config } = props.widget;

  const defaultProps = {
    isLoading,
  };

  const mappingProps = {
    table_dynamic_by_filter: {
      headerTitle: getTableDynamicFilterConfig()?.name_overwrite || name,
      headers: [
        {
          name: 'status',
          value: 'status',
          display: true,
          hidden_name: false,
        },
        ...(getTableDynamicFilterConfig()?.fields || []),
      ],
      items: data?.results || [],
    },
    table_group: {
      tabs: config,
      data: data?.results,
      paginationTotal: data?.count,
    },
  };

  return { ...defaultProps, ...mappingProps[type] };
});

const getTableDynamicFilterConfig = () => {
  const { config } = props.widget;
  return 'created_on' in props.appliedFilters
    ? config?.created_on
    : config?.default;
};

const redirectToTableAgents = () => {
  emits('redirect-to-expansive', props.widget);
};

const widgetEvents = computed(() => {
  const { type } = props.widget;

  const mappingEvents = {
    table_dynamic_by_filter: {
      seeMore: () => redirectToTableAgents(),
    },
    table_group: {
      requestData: ({ offset, limit }) =>
        emits('request-data', { offset, limit }),
    },
  };

  return mappingEvents[type] || {};
});
</script>
