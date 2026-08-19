import { defineStore } from 'pinia';
import { computed, inject, ref } from 'vue';
import type { Router } from 'vue-router';
import { useRouter } from 'vue-router';

import CTWADataService, {
  type CTWADashboardData,
} from '@/services/api/resources/ctwa/data';
import CTWAConversionsService, {
  type CTWAConversionsData,
} from '@/services/api/resources/ctwa/conversions';
import CTWAPerformanceByCampaignService, {
  type CampaignPerformanceRow,
} from '@/services/api/resources/ctwa/performanceByCampaign';
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

const emptyConversionsData = (): CTWAConversionsData => ({
  conversations_started: { total: null, percentage: null },
  conversations_qualified: { total: null, percentage: null },
  conversations_converted: { total: null, percentage: null },
});

const getQueryString = (value: unknown): string =>
  typeof value === 'string' ? value : '';

export const CAMPAIGN_PERFORMANCE_PAGE_SIZE = 10;

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

  const conversionsData = ref<CTWAConversionsData>(emptyConversionsData());
  const loadingConversionsData = ref(false);
  const hasLoadedConversionsData = ref(false);

  const campaignPerformanceResults = ref<CampaignPerformanceRow[]>([]);
  const campaignPerformanceCount = ref(0);
  const campaignPerformanceOffset = ref(0);
  const loadingCampaignPerformance = ref(false);
  const hasLoadedCampaignPerformance = ref(false);

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

  const loadConversionsData = async () => {
    hasLoadedConversionsData.value = true;
    try {
      loadingConversionsData.value = true;
      conversionsData.value = await CTWAConversionsService.getConversionsData();
    } catch (error) {
      console.error('Error loading CTWA conversions data:', error);
    } finally {
      loadingConversionsData.value = false;
    }
  };

  const loadCampaignPerformanceData = async (
    offset = campaignPerformanceOffset.value,
  ) => {
    hasLoadedCampaignPerformance.value = true;
    try {
      loadingCampaignPerformance.value = true;
      const data =
        await CTWAPerformanceByCampaignService.getPerformanceByCampaign({
          limit: CAMPAIGN_PERFORMANCE_PAGE_SIZE,
          offset,
        });
      campaignPerformanceResults.value = data.results;
      campaignPerformanceCount.value = data.count;
      campaignPerformanceOffset.value = offset;
    } catch (error) {
      console.error('Error loading CTWA campaign performance data:', error);
    } finally {
      loadingCampaignPerformance.value = false;
    }
  };

  const loadAllData = () => {
    if (hasLoadedDashboardData.value) loadDashboardData();
    if (hasLoadedConversionsData.value) loadConversionsData();
    if (hasLoadedCampaignPerformance.value) {
      loadCampaignPerformanceData(campaignPerformanceOffset.value);
    }
  };

  return {
    appliedDateRange,
    selectedCampaign,
    appliedFilters,
    dashboardData,
    loadingDashboardData,
    hasLoadedDashboardData,
    conversionsData,
    loadingConversionsData,
    hasLoadedConversionsData,
    campaignPerformanceResults,
    campaignPerformanceCount,
    campaignPerformanceOffset,
    loadingCampaignPerformance,
    hasLoadedCampaignPerformance,
    loadDashboardData,
    loadConversionsData,
    loadCampaignPerformanceData,
    loadAllData,
  };
});
