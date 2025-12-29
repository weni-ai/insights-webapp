import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useDashboards } from '../dashboards';
import { ServiceStatusDataResponse } from '@/services/api/resources/humanSupport/monitoring/serviceStatus';
import { TimeMetricsDataResponse } from '@/services/api/resources/humanSupport/monitoring/timeMetrics';
import { ServicesOpenByHourData } from '@/services/api/resources/humanSupport/monitoring/servicesOpenByHour';
import ServiceStatusService from '@/services/api/resources/humanSupport/monitoring/serviceStatus';
import TimeMetricsService from '@/services/api/resources/humanSupport/monitoring/timeMetrics';
import ServicesOpenByHourService from '@/services/api/resources/humanSupport/monitoring/servicesOpenByHour';

export type ActiveDetailedTab =
  | 'in_awaiting'
  | 'in_progress'
  | 'attendant'
  | 'pauses';

export const useHumanSupportMonitoring = defineStore(
  'humanSupportMonitoring',
  () => {
    const refreshDataMonitoring = ref<boolean>(false);
    const isSilentRefresh = ref<boolean>(false);
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

    const setRefreshDataMonitoring = (value: boolean, silent = false) => {
      refreshDataMonitoring.value = value;
      isSilentRefresh.value = silent;
    };

    const loadAllData = () => {
      loadServiceStatusData();
      loadTimeMetricsData();
      loadHumanSupportByHourData();
    };

    const loadServiceStatusData = async () => {
      try {
        if (!isSilentRefresh.value) {
          loadingServiceStatusData.value = true;
        }
        updateLastUpdatedRequest();
        const data = await ServiceStatusService.getServiceStatusData();

        serviceStatusData.value = data;
      } catch (error) {
        console.error('Error loading service status data:', error);
      } finally {
        if (!isSilentRefresh.value) {
          loadingServiceStatusData.value = false;
        }
      }
    };

    const loadTimeMetricsData = async () => {
      try {
        if (!isSilentRefresh.value) {
          loadingTimeMetricsData.value = true;
        }
        updateLastUpdatedRequest();

        const data = await TimeMetricsService.getTimeMetricsData();

        timeMetricsData.value = data;
      } catch (error) {
        console.error('Error loading time metrics data:', error);
      } finally {
        if (!isSilentRefresh.value) {
          loadingTimeMetricsData.value = false;
        }
      }
    };

    const loadHumanSupportByHourData = async () => {
      try {
        if (!isSilentRefresh.value) {
          loadingHumanSupportByHourData.value = true;
        }
        updateLastUpdatedRequest();
        const data =
          await ServicesOpenByHourService.getServicesOpenByHourData();

        servicesOpenByHourData.value = data;
      } catch (error) {
        console.error('Error loading human support by hour data:', error);
      } finally {
        if (!isSilentRefresh.value) {
          loadingHumanSupportByHourData.value = false;
        }
      }
    };

    watch(refreshDataMonitoring, (newValue) => {
      if (newValue) loadAllData();
    });

    return {
      isLoadingAllData,
      serviceStatusData,
      timeMetricsData,
      loadingServiceStatusData,
      loadingTimeMetricsData,
      loadingHumanSupportByHourData,
      servicesOpenByHourData,
      activeDetailedTab,
      refreshDataMonitoring,
      isSilentRefresh,
      loadAllData,
      loadServiceStatusData,
      loadTimeMetricsData,
      loadHumanSupportByHourData,
      setActiveDetailedTab,
      setRefreshDataMonitoring,
    };
  },
);
