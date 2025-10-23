import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ServiceStatusDataResponse } from '@/services/api/resources/humanSupport/monitoring/serviceStatus';
import { ServicesOpenByHourData } from '@/services/api/resources/humanSupport/monitoring/servicesOpenByHour';
import ServiceStatusService from '@/services/api/resources/humanSupport/monitoring/serviceStatus';
import ServicesOpenByHourService from '@/services/api/resources/humanSupport/monitoring/servicesOpenByHour';

export type ActiveDetailedTab = 'closed' | 'attendant' | 'pauses';

export const useHumanSupportAnalysis = defineStore(
  'humanSupportAnalysis',
  () => {
    const activeDetailedTab = ref<ActiveDetailedTab>('closed');
    const serviceStatusData = ref<ServiceStatusDataResponse>({
      is_waiting: null,
      in_progress: null,
      finished: null,
    });
    const servicesOpenByHourData = ref<ServicesOpenByHourData[]>([]);
    const loadingServiceStatusData = ref(false);
    const loadingHumanSupportByHourData = ref(false);

    const isLoadingAllData = computed(
      () =>
        loadingServiceStatusData.value || loadingHumanSupportByHourData.value,
    );

    const setActiveDetailedTab = (tab: ActiveDetailedTab) => {
      activeDetailedTab.value = tab;
    };

    const loadAllData = () => {
      loadServiceStatusData();
      loadHumanSupportByHourData();
    };

    const loadServiceStatusData = async () => {
      try {
        loadingServiceStatusData.value = true;
        const data = await ServiceStatusService.getServiceStatusData();

        serviceStatusData.value = data;
      } catch (error) {
        console.error('Error loading service status data:', error);
      } finally {
        loadingServiceStatusData.value = false;
      }
    };

    const loadHumanSupportByHourData = async () => {
      try {
        loadingHumanSupportByHourData.value = true;
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
      loadingServiceStatusData,
      loadingHumanSupportByHourData,
      servicesOpenByHourData,
      activeDetailedTab,
      loadAllData,
      loadServiceStatusData,
      loadHumanSupportByHourData,
      setActiveDetailedTab,
    };
  },
);
