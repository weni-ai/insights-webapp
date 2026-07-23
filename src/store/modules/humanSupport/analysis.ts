import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ServiceStatusFormattedResponse } from '@/services/api/resources/humanSupport/analysis/serviceStatus';
import { ServicesOpenByHourData } from '@/services/api/resources/humanSupport/analysis/servicesOpenByHour';
import ServiceStatusAnalysisService from '@/services/api/resources/humanSupport/analysis/serviceStatus';
import ServicesOpenByHourAnalysisService from '@/services/api/resources/humanSupport/analysis/servicesOpenByHour';

export type ActiveDetailedTab = 'finished' | 'attendant' | 'pauses';

export const useHumanSupportAnalysis = defineStore(
  'humanSupportAnalysis',
  () => {
    const activeDetailedTab = ref<ActiveDetailedTab>('finished');
    const forceLoadDetailed = ref<boolean>(false);
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

    // Tracks which data slices have already been requested (i.e. became
    // visible) so the central refresh only reloads on-screen widgets.
    const hasLoadedServiceStatus = ref(false);
    const hasLoadedHumanSupportByHour = ref(false);

    const isLoadingAllData = computed(
      () =>
        loadingServiceStatusData.value || loadingHumanSupportByHourData.value,
    );

    const setActiveDetailedTab = (tab: ActiveDetailedTab) => {
      activeDetailedTab.value = tab;
    };

    const setForceLoadDetailed = (value: boolean) => {
      forceLoadDetailed.value = value;
    };

    const loadAllData = () => {
      if (hasLoadedServiceStatus.value) loadServiceStatusData();
      if (hasLoadedHumanSupportByHour.value) loadHumanSupportByHourData();
    };

    const loadServiceStatusData = async () => {
      hasLoadedServiceStatus.value = true;
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
      hasLoadedHumanSupportByHour.value = true;
      try {
        loadingHumanSupportByHourData.value = true;
        const data =
          await ServicesOpenByHourAnalysisService.getServicesOpenByHourAnalysisData();

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
      forceLoadDetailed,
      loadAllData,
      loadServiceStatusData,
      loadHumanSupportByHourData,
      setActiveDetailedTab,
      setForceLoadDetailed,
    };
  },
);
