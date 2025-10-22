import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useHumanSupportMonitoring } from './monitoring';

interface Filter {
  value: string;
  label: string;
}

interface AppliedFilters {
  sectors: Filter[];
  queues: Filter[];
  tags: Filter[];
}

interface AppliedAgentFilter {
  value: string;
  label: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export const useHumanSupport = defineStore('humanSupport', () => {
  const humanSupportMonitoring = useHumanSupportMonitoring();
  const { loadAllData: loadAllDataMonitoring } = humanSupportMonitoring;
  const sectors = ref<Filter[]>([]);
  const queues = ref<Filter[]>([]);
  const tags = ref<Filter[]>([]);
  const appliedDateRange = ref<DateRange>({
    start: '',
    end: '',
  });
  const appliedFilters = ref<AppliedFilters>({
    sectors: [],
    queues: [],
    tags: [],
  });
  const appliedAgentFilter = ref<AppliedAgentFilter>({
    value: '',
    label: '',
  });

  const appliedFiltersLength = computed(() => {
    const sectorsLength = appliedFilters.value.sectors.length > 0 ? 1 : 0;
    const queuesLength = appliedFilters.value.queues.length > 0 ? 1 : 0;
    const tagsLength = appliedFilters.value.tags.length > 0 ? 1 : 0;

    const filtersLength = sectorsLength + queuesLength + tagsLength;

    return filtersLength;
  });

  const saveAppliedFilters = () => {
    appliedFilters.value = {
      sectors: [...sectors.value],
      queues: [...queues.value],
      tags: [...tags.value],
    };
  };

  const saveAppliedAgentFilter = (value: string, label: string) => {
    appliedAgentFilter.value = {
      value: value,
      label: label,
    };
  };

  const hasAppliedFiltersNoChanges = computed(() => {
    const areArraysEqual = (current: Filter[], applied: Filter[]) =>
      current.length === applied.length &&
      current.every((item) =>
        applied.some((app) => app.value === item.value),
      ) &&
      applied.every((app) => current.some((item) => item.value === app.value));

    return [
      [sectors.value, appliedFilters.value.sectors],
      [queues.value, appliedFilters.value.queues],
      [tags.value, appliedFilters.value.tags],
    ].every(([current, applied]) => areArraysEqual(current, applied));
  });

  const clearFilters = () => {
    const isSectorEmpty = sectors.value.length === 0;
    const isQueueEmpty = queues.value.length === 0;
    const isTagEmpty = tags.value.length === 0;

    const isAppliedFiltersEmpty =
      appliedFilters.value.sectors.length === 0 &&
      appliedFilters.value.queues.length === 0 &&
      appliedFilters.value.tags.length === 0;

    if (isSectorEmpty && isQueueEmpty && isTagEmpty && isAppliedFiltersEmpty) {
      return;
    }

    sectors.value = [];
    queues.value = [];
    tags.value = [];
    appliedFilters.value = {
      sectors: [],
      queues: [],
      tags: [],
    };
  };

  watch(appliedFilters, () => {
    loadAllDataMonitoring();
  });

  return {
    sectors,
    queues,
    tags,
    appliedDateRange,
    appliedFilters,
    appliedAgentFilter,
    appliedFiltersLength,
    saveAppliedFilters,
    saveAppliedAgentFilter,
    clearFilters,
    hasAppliedFiltersNoChanges,
  };
});
