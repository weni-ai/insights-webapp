import { defineStore } from 'pinia';
import { computed, inject, ref } from 'vue';
import type { Router } from 'vue-router';
import { useRouter } from 'vue-router';

import { getLastNDays } from '@/utils/time';

export interface DateRange {
  start: string;
  end: string;
}

const getQueryString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

export const useCTWA = defineStore('ctwa', () => {
  const router = inject<Router>('router', useRouter());
  const query = router?.currentRoute?.value?.query || {};

  const defaultDateRange = getLastNDays(7);
  const queryStartDate = getQueryString(query.start_date);
  const queryEndDate = getQueryString(query.end_date);

  const hasQueryDateRange = Boolean(queryStartDate && queryEndDate);

  const appliedDateRange = ref<DateRange>({
    start: hasQueryDateRange ? queryStartDate : defaultDateRange.start,
    end: hasQueryDateRange ? queryEndDate : defaultDateRange.end,
  });

  const selectedCampaign = ref(getQueryString(query.campaign));

  const appliedFilters = computed(() => ({
    start_date: appliedDateRange.value.start,
    end_date: appliedDateRange.value.end,
    ...(selectedCampaign.value && { campaign: selectedCampaign.value }),
  }));

  return {
    appliedDateRange,
    selectedCampaign,
    appliedFilters,
  };
});
