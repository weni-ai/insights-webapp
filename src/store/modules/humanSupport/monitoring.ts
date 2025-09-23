import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useDashboards } from '../dashboards';
import { ServiceStatusDataResponse } from '@/services/api/resources/humanSupport/serviceStatus';
//import ServiceStatusService from '@/services/api/resources/humanSupport/serviceStatus';

interface Filter {
  value: string;
  label: string;
}
interface AppliedFilters {
  sectors: Filter[];
  queues: Filter[];
  tags: Filter[];
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
    const serviceStatusData = ref<ServiceStatusDataResponse>({
      is_awaiting: null,
      in_progress: null,
      finished: null,
    });
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
      loadingServiceStatusData,
      loadingTimeMetricsData,
      loadingHumanSupportByHourData,
      hasAppliedFiltersNoChanges,

      loadAllData,
      loadServiceStatusData,
      loadTimeMetricsData,
      loadHumanSupportByHourData,
      saveAppliedFilters,
      clearFilters,
    };
  },
);
