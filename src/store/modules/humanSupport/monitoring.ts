import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useDashboards } from '../dashboards';
import { ServiceStatusDataResponse } from '@/services/api/resources/humanSupport/serviceStatus';
import { TimeMetricsDataResponse } from '@/services/api/resources/humanSupport/timeMetrics';
import { ServicesOpenByHourData } from '@/services/api/resources/humanSupport/servicesOpenByHour';
import ServiceStatusService from '@/services/api/resources/humanSupport/serviceStatus';
import TimeMetricsService from '@/services/api/resources/humanSupport/timeMetrics';
import ServicesOpenByHourService from '@/services/api/resources/humanSupport/servicesOpenByHour';

export type ActiveDetailedTab =
  | 'in_awaiting'
  | 'in_progress'
  | 'attendant'
  | 'pauses';

export const useHumanSupportMonitoring = defineStore(
  'humanSupportMonitoring',
  () => {
    const refreshDetailedTabData = ref<boolean>(false);
    const activeDetailedTab = ref<ActiveDetailedTab>('in_progress');
    const serviceStatusData = ref<ServiceStatusDataResponse>({
      is_waiting: null,
      in_progress: null,
      finished: null,
    });
    const timeMetricsData = ref<TimeMetricsDataResponse>({
      average_time_is_waiting: { average: null, max: null },
      average_time_first_response: { average: null, max: null },
      average_time_chat: { average: null, max: null },
    });
    const servicesOpenByHourData = ref<ServicesOpenByHourData[]>([]);
    const loadingServiceStatusData = ref(false);
    const loadingTimeMetricsData = ref(false);
    const loadingHumanSupportByHourData = ref(false);

    const { updateLastUpdatedRequest } = useDashboards();

    const isLoadingAllData = computed(
      () =>
        loadingServiceStatusData.value ||
        loadingTimeMetricsData.value ||
        loadingHumanSupportByHourData.value,
    );

    const setActiveDetailedTab = (tab: ActiveDetailedTab) => {
      activeDetailedTab.value = tab;
    };

    const setRefreshDetailedTabData = (value: boolean) => {
      refreshDetailedTabData.value = value;
    };

    const loadAllData = () => {
      loadServiceStatusData();
      loadTimeMetricsData();
      loadHumanSupportByHourData();
    };

    const loadServiceStatusData = async () => {
      try {
        loadingServiceStatusData.value = true;
        updateLastUpdatedRequest();
        const data = await ServiceStatusService.getServiceStatusData();

        serviceStatusData.value = data;
      } catch (error) {
        console.error('Error loading service status data:', error);
      } finally {
        loadingServiceStatusData.value = false;
      }
    };

    const loadTimeMetricsData = async () => {
      try {
        loadingTimeMetricsData.value = true;
        updateLastUpdatedRequest();

        const data = await TimeMetricsService.getTimeMetricsData();

        timeMetricsData.value = data;
      } catch (error) {
        console.error('Error loading time metrics data:', error);
      } finally {
        loadingTimeMetricsData.value = false;
      }
    };

    const loadHumanSupportByHourData = async () => {
      try {
        loadingHumanSupportByHourData.value = true;
        updateLastUpdatedRequest();
        const data =
          await ServicesOpenByHourService.getServicesOpenByHourData();

        servicesOpenByHourData.value = data;
      } catch (error) {
        console.error('Error loading human support by hour data:', error);
      } finally {
        loadingHumanSupportByHourData.value = false;
      }
    };

    return {
      isLoadingAllData,
      serviceStatusData,
      timeMetricsData,
      loadingServiceStatusData,
      loadingTimeMetricsData,
      loadingHumanSupportByHourData,
      servicesOpenByHourData,
      activeDetailedTab,
      refreshDetailedTabData,

      loadAllData,
      loadServiceStatusData,
      loadTimeMetricsData,
      loadHumanSupportByHourData,
      setActiveDetailedTab,
      setRefreshDetailedTabData,
    };
  },
);
