import { defineStore } from 'pinia';
import { computed, ref, watch, inject } from 'vue';
import { useHumanSupportMonitoring } from './monitoring';
import { useHumanSupportAnalysis } from './analysis';
import { getLastNDays } from '@/utils/time';
import type { Router } from 'vue-router';
import { useRouter } from 'vue-router';

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

type DetailFilterType = 'agent' | 'contact' | 'ticketId' | 'contactInput';

interface AppliedDetailFilters {
  agent: AppliedDetailFilter;
  contact: AppliedDetailFilter;
  ticketId: AppliedDetailFilter;
  contactInput: AppliedDetailFilter;
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

  const router = inject<Router>('router', useRouter());
  const query = router?.currentRoute?.value?.query || {};

  const currentDateRange =
    typeof query.start_date === 'string' && typeof query.end_date === 'string'
      ? {
          start: query.start_date,
          end: query.end_date,
        }
      : getLastNDays(7);

  const activeTab = ref<ActiveTab>('monitoring');
  const sectors = ref<Filter[]>([]);
  const queues = ref<Filter[]>([]);
  const tags = ref<Filter[]>([]);

  const appliedDateRange = ref<DateRange>({
    start: currentDateRange.start,
    end: currentDateRange.end,
  });

  const appliedFilters = ref<AppliedFilters>({
    sectors: [],
    queues: [],
    tags: [],
  });

  const appliedDetailFilters = ref<AppliedDetailFilters>({
    agent: { value: '', label: '' },
    contact: { value: '', label: '' },
    ticketId: { value: '', label: '' },
    contactInput: { value: '', label: '' },
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

  const saveAppliedDetailFilter = (
    type: DetailFilterType,
    value: string,
    label: string,
  ) => {
    appliedDetailFilters.value[type] = { value, label };
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

  const clearAppliedDetailFilters = () => {
    appliedDetailFilters.value = {
      agent: { value: '', label: '' },
      contact: { value: '', label: '' },
      ticketId: { value: '', label: '' },
      contactInput: { value: '', label: '' },
    };
  };

  watch(appliedFilters, () => {
    if (activeTab.value === 'monitoring') return loadAllDataMonitoring();
    if (activeTab.value === 'analysis') return loadAllDataAnalysis();
  });

  watch(appliedDateRange, () => {
    if (activeTab.value === 'analysis') return loadAllDataAnalysis();
  });

  watch(activeTab, () => {
    clearAppliedDetailFilters();
  });

  return {
    activeTab,
    sectors,
    queues,
    tags,
    appliedDateRange,
    appliedFilters,
    appliedDetailFilters,
    appliedFiltersLength,
    saveAppliedFilters,
    saveAppliedDetailFilter,
    setActiveTab,
    clearFilters,
    hasAppliedFiltersNoChanges,
  };
});
