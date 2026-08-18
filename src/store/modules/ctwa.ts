import { defineStore } from 'pinia';
import { computed, inject, ref } from 'vue';
import type { Router } from 'vue-router';
import { useRouter } from 'vue-router';

import CTWADataService, {
  type CTWADashboardData,
} from '@/services/api/resources/ctwa/data';
import { getLastNDays } from '@/utils/time';

export interface DateRange {
  start: string;
  end: string;
}

const emptyDashboardData = (): CTWADashboardData => ({
  attributed_revenue: { value: null, avg: null },
  ctwa_conversations: null,
  organic_conversations: null,
});

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

  const dashboardData = ref<CTWADashboardData>(emptyDashboardData());
  const loadingDashboardData = ref(false);
  const hasLoadedDashboardData = ref(false);

  const appliedFilters = computed(() => ({
    start_date: appliedDateRange.value.start,
    end_date: appliedDateRange.value.end,
    ...(selectedCampaign.value && { campaign: selectedCampaign.value }),
  }));

  const loadDashboardData = async () => {
    hasLoadedDashboardData.value = true;
    try {
      loadingDashboardData.value = true;
      dashboardData.value = await CTWADataService.getDashboardData();
    } catch (error) {
      console.error('Error loading CTWA dashboard data:', error);
    } finally {
      loadingDashboardData.value = false;
    }
  };

  return {
    appliedDateRange,
    selectedCampaign,
    appliedFilters,
    dashboardData,
    loadingDashboardData,
    hasLoadedDashboardData,
    loadDashboardData,
  };
});
