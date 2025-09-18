import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useDashboards } from '../dashboards';

interface Filter {
  value: string;
  label: string;
}

export const useHumanSupportMonitoring = defineStore(
  'humanSupportMonitoring',
  () => {
    const sectors = ref<Filter[]>([]);
    const queues = ref<Filter[]>([]);
    const tags = ref<Filter[]>([]);
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

    return {
      sectors,
      queues,
      tags,
      isLoadingData,

      loadData,
    };
  },
);
