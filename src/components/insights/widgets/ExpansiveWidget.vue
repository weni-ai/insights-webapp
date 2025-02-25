<template>
  <section
    :class="{
      'expansive-widget': true,
      'expansive-widget--loading': isLoading,
    }"
  >
    <IconLoading v-if="isLoading" />
    <component
      :is="currentComponent"
      v-else-if="widget"
      v-bind="widgetProps"
      v-on="widgetEvents"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import IconLoading from '@/components/IconLoading.vue';
import HumanServiceAgentsTable from './HumanServiceAgentsTable/index.vue';

const props = defineProps({
  widget: {
    type: Object,
    required: true,
  },
});

const store = useStore();

const isLoading = computed(() => {
  return false;
});

const appliedFilters = computed(() => {
  return store.state.dashboards.appliedFilters;
});

const currentComponent = computed(() => {
  const componentMap = {
    table_dynamic_by_filter: HumanServiceAgentsTable,
  };

  return componentMap[props.widget.type] || null;
});

const widgetProps = computed(() => {
  const { name, data, type, config } = props.widget;

  const defaultProps = {
    isLoading,
  };

  const tableDynamicFilterConfig =
    'created_on' in appliedFilters.value ? config?.created_on : config?.default;

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
      ],
      items: data?.results || [],
    },
  };

  return { ...defaultProps, ...mappingProps[type] };
});

const widgetEvents = computed(() => {
  return null;
});
</script>

<style lang="scss" scoped>
.expansive-widget {
  overflow: hidden;

  height: 100%;

  display: grid;

  gap: $unnnic-spacing-sm;

  &--loading {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  & > [class*='chart'] {
    border-radius: $unnnic-spacing-nano;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

    :deep([class*='title']) {
      font-size: $unnnic-font-size-body-lg;
    }
  }
}
</style>
