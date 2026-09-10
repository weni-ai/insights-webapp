import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  SalesDataResponse,
  TotalRevenueData,
} from '@/services/api/resources/humanSupport/sales/salesData';
import SalesDataService from '@/services/api/resources/humanSupport/sales/salesData';

interface SalesDataState {
  average_order_value: number | null;
  total_revenue: {
    value: number | null;
    last_period_value: number | null;
    variation: number | null;
  };
}

const createInitialSalesData = (): SalesDataState => ({
  average_order_value: null,
  total_revenue: {
    value: null,
    last_period_value: null,
    variation: null,
  },
});

export const useHumanSupportSales = defineStore('humanSupportSales', () => {
  const salesData = ref<SalesDataState>(createInitialSalesData());
  const loadingSalesData = ref(false);
  const hasLoadedSalesData = ref(false);

  const isLoadingAllData = computed(() => loadingSalesData.value);

  const loadAllData = () => {
    if (hasLoadedSalesData.value) loadSalesData();
  };

  const loadSalesData = async () => {
    hasLoadedSalesData.value = true;
    try {
      loadingSalesData.value = true;
      const data: SalesDataResponse = await SalesDataService.getSalesData();

      salesData.value = {
        average_order_value: data.average_order_value,
        total_revenue: {
          value: data.total_revenue.value,
          last_period_value: data.total_revenue.last_period_value,
          variation: data.total_revenue.variation,
        },
      };
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      loadingSalesData.value = false;
    }
  };

  return {
    isLoadingAllData,
    salesData,
    loadingSalesData,
    loadAllData,
    loadSalesData,
  };
});

export type { SalesDataState, TotalRevenueData };
