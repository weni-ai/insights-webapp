import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useDashboards } from '../dashboards';

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
    const loadingData = ref(false);
    const { updateLastUpdatedRequest } = useDashboards();

    const loadData = async () => {
      try {
        loadingData.value = true;

        await new Promise((resolve) => setTimeout(resolve, 3000));
        updateLastUpdatedRequest();
      } catch (error) {
        console.error('Error loading monitoring data:', error);
      } finally {
        loadingData.value = false;
      }
    };

    const isLoadingData = computed(() => loadingData.value);

    const appliedFiltersLength = computed(() => {
      const sectorsLength = appliedFilters.value.sectors.length > 0 ? 1 : 0;
      const queuesLength = appliedFilters.value.queues.length > 0 ? 1 : 0;
      const tagsLength = appliedFilters.value.tags.length > 0 ? 1 : 0;

      const filtersLength = sectorsLength + queuesLength + tagsLength;

      return filtersLength;
    });

    const saveAppliedFilters = () => {
      const filters = {
        sectors: sectors.value,
        queues: queues.value,
        tags: tags.value,
      };
      appliedFilters.value = filters;
    };

    return {
      sectors,
      queues,
      tags,
      isLoadingData,
      appliedFiltersLength,

      loadData,
      saveAppliedFilters,
    };
  },
);
