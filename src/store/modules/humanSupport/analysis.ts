import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ServiceStatusFormattedResponse } from '@/services/api/resources/humanSupport/analysis/serviceStatus';
import { ServicesOpenByHourData } from '@/services/api/resources/humanSupport/monitoring/servicesOpenByHour';
import ServiceStatusAnalysisService from '@/services/api/resources/humanSupport/analysis/serviceStatus';
import ServicesOpenByHourService from '@/services/api/resources/humanSupport/monitoring/servicesOpenByHour';

export type ActiveDetailedTab = 'finished' | 'attendant' | 'pauses';

export const useHumanSupportAnalysis = defineStore(
  'humanSupportAnalysis',
  () => {
    const activeDetailedTab = ref<ActiveDetailedTab>('finished');
    const serviceStatusData = ref<ServiceStatusFormattedResponse>({
      finished: null,
      average_time_is_waiting: null,
      average_time_first_response: null,
      average_response_time: null,
      average_time_chat: null,
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
        const data =
          await ServiceStatusAnalysisService.getServiceStatusAnalysisData();

        serviceStatusData.value = data;
      } catch (error) {
        console.error('Error loading service status analysis data:', error);
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
