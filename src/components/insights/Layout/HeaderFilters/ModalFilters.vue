<template>
  <UnnnicDialog
    :open="showModal"
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent
      size="medium"
      class="modal-filters"
    >
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>
          {{ $t('insights_header.filters') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <form
        class="modal-filters__form"
        @submit.prevent
      >
        <template
          v-for="filter of currentDashboardFilters"
          :key="filter.name"
        >
          <DynamicFilter
            data-testid="dynamic-filter"
            :modelValue="filtersInternal[filter.name]"
            :filter="filter"
            :disabled="handleDisabledFilter(filter)"
            :dependsOnValue="getDynamicFiltersDependsOnValues(filter)"
            @update:model-value="updateFilter(filter.name, $event)"
          />
        </template>
      </form>

      <UnnnicDialogFooter>
        <UnnnicButton
          type="tertiary"
          :text="$t('insights_header.clear_filters')"
          :disabled="!hasFiltersInternal"
          @click="clearFilters"
        />
        <UnnnicButton
          type="primary"
          :text="$t('insights_header.filtrate')"
          @click="setFilters"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import {
  UnnnicButton,
  UnnnicDialog,
  UnnnicDialogContent,
  UnnnicDialogFooter,
  UnnnicDialogHeader,
  UnnnicDialogTitle,
} from '@weni/unnnic-system';

import { useDashboards } from '@/store/modules/dashboards';
import { useSectors } from '@/store/modules/sectors';

import DynamicFilter from './DynamicFilter.vue';

defineOptions({ name: 'ModalFilters' });

defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const dashboardsStore = useDashboards();
const sectorsStore = useSectors();
const { currentDashboardFilters, appliedFilters } =
  storeToRefs(dashboardsStore);
const { sectors, getSectorByUuid } = storeToRefs(sectorsStore);

const filtersInternal = ref<Record<string, any>>({});

const hasFiltersInternal = computed(
  () => Object.keys(filtersInternal.value).length,
);

const areStoreFiltersAndInternalEqual = computed(
  () =>
    JSON.stringify(appliedFilters.value) ===
    JSON.stringify(filtersInternal.value),
);

const handleOpenChange = (isOpen: boolean) => {
  if (!isOpen) {
    close();
  }
};

const getDynamicFiltersDependsOnValues = (filter: Record<string, any>) => {
  if (!filter.depends_on?.search_param) return null;

  const { search_param, filter: filterName } = filter.depends_on;

  if (search_param === 'sector_id') {
    return {
      [search_param]: filtersInternal.value[filterName]?.[0]?.value,
    };
  }
  return {
    [search_param]: filtersInternal.value[filterName],
  };
};

const handleDisabledFilter = (filter: Record<string, any>) => {
  if (['tags', 'queue'].includes(filter.name)) {
    const disableTagsAndQueueFilter =
      filtersInternal.value[filter.depends_on?.filter]?.length !== 1;

    if (disableTagsAndQueueFilter) {
      filtersInternal.value[filter.name] = undefined;
    }

    return disableTagsAndQueueFilter;
  }

  return filter.depends_on && !filtersInternal.value[filter.depends_on?.filter];
};

const clearFilters = () => {
  filtersInternal.value = {};
};

const updateFilter = (filterName: string, value: any) => {
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
  const processedFilters = { ...filtersInternal.value };

  if (processedFilters.sector && Array.isArray(processedFilters.sector)) {
    processedFilters.sector = processedFilters.sector.map(
      (item: any) => item.value,
    );
  }
  if (Object.keys(processedFilters).length) {
    dashboardsStore.setAppliedFilters(processedFilters);
  } else {
    dashboardsStore.resetAppliedFilters();
  }
  close();
};

const handleSyncFilters = () => {
  const processedFilters = { ...appliedFilters.value };

  if (processedFilters.sector) {
    const sectorValues = Array.isArray(processedFilters.sector)
      ? processedFilters.sector
      : [];

    processedFilters.sector = sectorValues.map((value: any) => {
      const trimmedValue = typeof value === 'string' ? value.trim() : value;
      const sector = getSectorByUuid.value(trimmedValue);
      return {
        value: trimmedValue,
        label: sector ? sector.name : null,
      };
    });
  }

  filtersInternal.value = processedFilters;
};

const syncFiltersInternal = () => {
  if (!areStoreFiltersAndInternalEqual.value) {
    handleSyncFilters();
  }
};

const close = () => {
  emit('close');
};

watch(appliedFilters, syncFiltersInternal);
watch(sectors, handleSyncFilters);

syncFiltersInternal();

defineExpose({
  filtersInternal,
  hasFiltersInternal,
  areStoreFiltersAndInternalEqual,
  getDynamicFiltersDependsOnValues,
  handleDisabledFilter,
  clearFilters,
  updateFilter,
  setFilters,
  syncFiltersInternal,
  handleSyncFilters,
  close,
  setAppliedFilters: (...args: any[]) =>
    dashboardsStore.setAppliedFilters(...args),
  resetAppliedFilters: (...args: any[]) =>
    dashboardsStore.resetAppliedFilters(...args),
});
</script>

<style lang="scss" scoped>
.modal-filters {
  &__form {
    display: grid;
    gap: $unnnic-space-2 $unnnic-space-4;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(4, 1fr);

    padding: $unnnic-space-6;
    text-align: left;

    > :nth-child(1),
    > :nth-child(2) {
      grid-column-start: 1;
      grid-column-end: 3;
    }
  }
}
</style>
