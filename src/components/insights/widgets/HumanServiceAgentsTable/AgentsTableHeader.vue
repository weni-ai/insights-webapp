<template>
  <div class="agents-table-header">
    <template
      v-for="filter in currentDashboardFilters"
      :key="filter.name"
    >
      <DynamicFilter
        :modelValue="filtersInternal[filter.name]"
        :filter="filter"
        :disabled="
          filter.depends_on && !filtersInternal[filter.depends_on?.filter]
        "
        :dependsOnValue="getDynamicFiltersDependsOnValues(filter)"
        @update:model-value="updateFilter(filter.name, $event)"
      />
    </template>
    <UnnnicButton
      :text="$t('insights_header.refresh')"
      type="secondary"
      iconLeft="refresh"
      @click="updateTableData"
    />
    <UnnnicButton
      :text="$t('insights_header.clear_filters')"
      type="tertiary"
      :disabled="!hasFiltersInternal"
      @click="clearFilters"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useStore } from 'vuex';
import DynamicFilter from '@/components/insights/Layout/HeaderFilters/DynamicFilter.vue';

const store = useStore();
const filtersInternal = ref({});

const currentDashboardFilters = computed(() => {
  const filters = ['sectors', 'queues'];

  return store.state.dashboards.currentDashboardFilters.filter((filter) =>
    filters.includes(filter.source),
  );
});
const appliedFilters = computed(() => store.state.dashboards.appliedFilters);
const hasFiltersInternal = computed(
  () => Object.keys(filtersInternal.value).length > 0,
);
const areStoreFiltersAndInternalEqual = computed(
  () =>
    JSON.stringify(appliedFilters.value) ===
    JSON.stringify(filtersInternal.value),
);

const getDynamicFiltersDependsOnValues = (filter) => {
  if (!filter.depends_on?.search_param) return null;
  const { search_param, filter: filterName } = filter.depends_on;
  return { [search_param]: filtersInternal.value[filterName] };
};

const clearFilters = () => {
  filtersInternal.value = {};
};

const updateTableData = () => {
  store.dispatch('dashboards/resetAppliedFilters');
};

const updateFilter = (filterName, value) => {
  const hasNonNullValues =
    typeof value === 'object' && value
      ? Object.values(value).some((val) => val)
      : value;
  if (hasNonNullValues) {
    filtersInternal.value[filterName] = value;
  } else {
    delete filtersInternal.value[filterName];
  }
};

const setFilters = () => {
  if (Object.keys(filtersInternal.value).length) {
    store.dispatch('dashboards/setAppliedFilters', filtersInternal.value);
  } else {
    store.dispatch('dashboards/resetAppliedFilters');
  }
};

const syncFiltersInternal = () => {
  if (!areStoreFiltersAndInternalEqual.value) {
    filtersInternal.value = appliedFilters.value;
  }
};

watch(appliedFilters, syncFiltersInternal, { immediate: true });
watch(filtersInternal, setFilters, { deep: true });
</script>

<style scoped lang="scss">
.agents-table-header {
  display: flex;
  flex-direction: row;
  align-items: end;
  width: 100%;
  gap: 1rem;
}
</style>
