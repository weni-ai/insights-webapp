<template>
  <section
    :class="{
      'expansive-widget': true,
    }"
    data-testid="expansive-widget"
  >
    <component
      :is="currentComponent"
      if="widget"
      v-bind="widgetProps"
      data-testid="expansive-widget-component"
      v-on="widgetEvents"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, ref } from 'vue';

import { useWidgets } from '@/store/modules/widgets';
import HumanServiceAgentsTable from './HumanServiceAgentsTable/index.vue';

const POLLING_INTERVAL = 60000; // 1 minute in milliseconds
const pollingInterval = ref<number | null>(null);

const props = defineProps({
  widget: {
    type: Object,
    required: true,
  },
});

const widgetsStore = useWidgets();

const isLoading = computed(() => {
  return widgetsStore.isLoadingCurrentExpansiveWidget;
});

const currentExpansiveWidgetFilters = computed(() => {
  return widgetsStore.currentExpansiveWidgetFilters;
});

const currentComponent = computed(() => {
  const componentMap = {
    table_dynamic_by_filter: HumanServiceAgentsTable,
  };

  return componentMap[props.widget.value.type] || null;
});

const widgetProps = computed(() => {
  const { name, data, type, config } = props.widget.value;

  const defaultProps = {
    isLoading: isLoading.value,
    isExpansive: true,
  };

  const tableDynamicFilterConfig = config?.default;

  const tableDynamicHeaders = tableDynamicFilterConfig?.fields || [];

  const mappingProps = {
    table_dynamic_by_filter: {
      headerTitle: tableDynamicFilterConfig?.name_overwrite || name,
      headers: [
        {
          name: 'status',
          value: 'status',
          display: true,
          hidden_name: false,
        },
        ...tableDynamicHeaders,
        ...(data?.results?.[0]?.custom_status?.map((status) => ({
          name: status.status_type,
          value: `custom_status.${status.status_type}`,
          display: true,
          hidden_name: false,
        })) || []),
      ],
      items: data?.results
        ? data.results.map((item) => ({
            ...item,
            custom_status: item.custom_status
              ? Object.fromEntries(
                  item?.custom_status?.map((status) => [
                    status.status_type,
                    status.break_time,
                  ]),
                )
              : {},
          }))
        : [],
    },
  };

  return { ...defaultProps, ...mappingProps[type] };
});

const widgetEvents = computed(() => {
  return null;
});

const updateWidgetData = async () => {
  if (props.widget.value.type === 'table_dynamic_by_filter') {
    await widgetsStore.updateCurrentExpansiveWidgetData({
      ...props.widget.value,
    });
  }
};

onMounted(() => {
  pollingInterval.value = window.setInterval(() => {
    updateWidgetData();
  }, POLLING_INTERVAL);
});

onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
    pollingInterval.value = null;
  }
});

watch(currentExpansiveWidgetFilters, () => {
  updateWidgetData();
});
</script>

<style lang="scss" scoped>
.expansive-widget {
  overflow: hidden;

  height: 100%;

  display: grid;

  gap: $unnnic-spacing-sm;

  & > [class*='chart'] {
    border-radius: $unnnic-spacing-nano;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

    :deep([class*='title']) {
      font-size: $unnnic-font-size-body-lg;
    }
  }
}
</style>
