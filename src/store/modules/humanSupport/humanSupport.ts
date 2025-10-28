import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useHumanSupportMonitoring } from './monitoring';
import { useHumanSupportAnalysis } from './analysis';
import { getLastNDays } from '@/utils/time';

interface Filter {
  value: string;
  label: string;
}

interface AppliedFilters {
  sectors: Filter[];
  queues: Filter[];
  tags: Filter[];
}

interface AppliedDetailFilter {
  value: string;
  label: string;
}
export interface DateRange {
  start: string;
  end: string;
}

export type ActiveTab = 'monitoring' | 'analysis';

export const useHumanSupport = defineStore('humanSupport', () => {
  const humanSupportMonitoring = useHumanSupportMonitoring();
  const { loadAllData: loadAllDataMonitoring } = humanSupportMonitoring;
  const humanSupportAnalysis = useHumanSupportAnalysis();
  const { loadAllData: loadAllDataAnalysis } = humanSupportAnalysis;
  const activeTab = ref<ActiveTab>('monitoring');
  const sectors = ref<Filter[]>([]);
  const queues = ref<Filter[]>([]);
  const tags = ref<Filter[]>([]);
  const defaultDateFormat = getLastNDays(7);
  const appliedDateRange = ref<DateRange>({
    start: defaultDateFormat.start,
    end: defaultDateFormat.end,
  });
  const appliedFilters = ref<AppliedFilters>({
    sectors: [],
    queues: [],
    tags: [],
  });
  const appliedAgentFilter = ref<AppliedDetailFilter>({
    value: '',
    label: '',
  });
  const appliedContactFilter = ref<AppliedDetailFilter>({
    value: '',
    label: '',
  });
  const appliedTicketIdFilter = ref<AppliedDetailFilter>({
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

  const saveAppliedContactFilter = (value: string, label: string) => {
    appliedContactFilter.value = {
      value: value,
      label: label,
    };
  };

  const saveAppliedTicketIdFilter = (value: string, label: string) => {
    appliedTicketIdFilter.value = {
      value: value,
      label: label,
    };
  };

  const setActiveTab = (tab: ActiveTab) => {
    activeTab.value = tab;
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
    if (activeTab.value === 'monitoring') return loadAllDataMonitoring();
    if (activeTab.value === 'analysis') return loadAllDataAnalysis();
  });

  watch(appliedDateRange, () => {
    if (activeTab.value === 'analysis') return loadAllDataAnalysis();
  });

  return {
    activeTab,
    sectors,
    queues,
    tags,
    appliedDateRange,
    appliedFilters,
    appliedAgentFilter,
    appliedContactFilter,
    appliedTicketIdFilter,
    appliedFiltersLength,
    saveAppliedFilters,
    saveAppliedAgentFilter,
    saveAppliedContactFilter,
    saveAppliedTicketIdFilter,
    setActiveTab,
    clearFilters,
    hasAppliedFiltersNoChanges,
  };
});
