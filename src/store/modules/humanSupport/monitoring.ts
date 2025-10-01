import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useDashboards } from '../dashboards';
import { ServiceStatusDataResponse } from '@/services/api/resources/humanSupport/serviceStatus';
import { TimeMetricsDataResponse } from '@/services/api/resources/humanSupport/timeMetrics';
import { ServicesOpenByHourData } from '@/services/api/resources/humanSupport/servicesOpenByHour';
//import ServiceStatusService from '@/services/api/resources/humanSupport/serviceStatus';
//import TimeMetricsService from '@/services/api/resources/humanSupport/timeMetrics';
//import ServicesOpenByHourService from '@/services/api/resources/humanSupport/servicesOpenByHour';

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

export const useHumanSupportMonitoring = defineStore(
  'humanSupportMonitoring',
  () => {
    const sectors = ref<Filter[]>([]);
    const queues = ref<Filter[]>([]);
    const tags = ref<Filter[]>([]);
    const appliedFilters = ref<AppliedFilters>({
      sectors: [],
      queues: [],
      tags: [],
    });
    const appliedAgentFilter = ref<AppliedAgentFilter>({
      value: '',
      label: '',
    });
    const serviceStatusData = ref<ServiceStatusDataResponse>({
      is_awaiting: null,
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
        applied.every((app) =>
          current.some((item) => item.value === app.value),
        );

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

      if (
        isSectorEmpty &&
        isQueueEmpty &&
        isTagEmpty &&
        isAppliedFiltersEmpty
      ) {
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

    const loadAllData = () => {
      loadServiceStatusData();
      loadTimeMetricsData();
      loadHumanSupportByHourData();
    };

    const loadServiceStatusData = async () => {
      try {
        loadingServiceStatusData.value = true;
        updateLastUpdatedRequest();
        await new Promise((resolve) => setTimeout(resolve, 3000));
        //serviceStatusData.value = await ServiceStatusService.getServiceStatusData();
        serviceStatusData.value = {
          is_awaiting: Math.floor(Math.random() * 100),
          in_progress: Math.floor(Math.random() * 100),
          finished: Math.floor(Math.random() * 100),
        };
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
        await new Promise((resolve) => setTimeout(resolve, 3000));
        //timeMetricsData.value = await TimeMetricsService.getTimeMetricsData();
        timeMetricsData.value = {
          average_time_is_waiting: {
            average: Math.floor(Math.random() * 300) + 30,
            max: Math.floor(Math.random() * 600) + 300,
          },
          average_time_first_response: {
            average: Math.floor(Math.random() * 60) + 10,
            max: Math.floor(Math.random() * 120) + 60,
          },
          average_time_chat: {
            average: Math.floor(Math.random() * 900) + 180,
            max: Math.floor(Math.random() * 1800) + 900,
          },
        };
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
        await new Promise((resolve) => setTimeout(resolve, 3000));
        //servicesOpenByHourData.value = await ServicesOpenByHourService.getServicesOpenByHourData();
        servicesOpenByHourData.value = [
          { label: '0h', value: Math.floor(Math.random() * 100) },
          { label: '1h', value: Math.floor(Math.random() * 100) },
          { label: '2h', value: Math.floor(Math.random() * 100) },
          { label: '3h', value: Math.floor(Math.random() * 100) },
          { label: '4h', value: Math.floor(Math.random() * 100) },
          { label: '5h', value: Math.floor(Math.random() * 100) },
          { label: '6h', value: Math.floor(Math.random() * 100) },
          { label: '7h', value: Math.floor(Math.random() * 100) },
          { label: '8h', value: Math.floor(Math.random() * 100) },
          { label: '9h', value: Math.floor(Math.random() * 100) },
          { label: '10h', value: Math.floor(Math.random() * 100) },
          { label: '11h', value: Math.floor(Math.random() * 100) },
          { label: '12h', value: Math.floor(Math.random() * 100) },
          { label: '13h', value: Math.floor(Math.random() * 100) },
          { label: '14h', value: Math.floor(Math.random() * 100) },
          { label: '15h', value: Math.floor(Math.random() * 100) },
          { label: '16h', value: Math.floor(Math.random() * 100) },
          { label: '17h', value: Math.floor(Math.random() * 100) },
          { label: '18h', value: Math.floor(Math.random() * 100) },
          { label: '19h', value: Math.floor(Math.random() * 100) },
          { label: '20h', value: Math.floor(Math.random() * 100) },
          { label: '21h', value: Math.floor(Math.random() * 100) },
          { label: '22h', value: Math.floor(Math.random() * 100) },
          { label: '23h', value: Math.floor(Math.random() * 100) },
        ];
      } catch (error) {
        console.error('Error loading human support by hour data:', error);
      } finally {
        loadingHumanSupportByHourData.value = false;
      }
    };

    watch(appliedFilters, () => {
      loadAllData();
    });

    return {
      sectors,
      queues,
      tags,
      isLoadingAllData,
      appliedFiltersLength,
      appliedFilters,
      serviceStatusData,
      timeMetricsData,
      loadingServiceStatusData,
      loadingTimeMetricsData,
      loadingHumanSupportByHourData,
      hasAppliedFiltersNoChanges,
      servicesOpenByHourData,
      appliedAgentFilter,

      loadAllData,
      loadServiceStatusData,
      loadTimeMetricsData,
      loadHumanSupportByHourData,
      saveAppliedFilters,
      saveAppliedAgentFilter,
      clearFilters,
    };
  },
);
