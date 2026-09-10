import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  SalesDataResponse,
  TotalRevenueData,
} from '@/services/api/resources/humanSupport/sales/salesData';
import SalesDataService from '@/services/api/resources/humanSupport/sales/salesData';
import { PurchasesMadeResponse } from '@/services/api/resources/humanSupport/sales/purchasesMade';
import PurchasesMadeService from '@/services/api/resources/humanSupport/sales/purchasesMade';

interface SalesDataState {
  average_order_value: number | null;
  total_revenue: {
    value: number | null;
    last_period_value: number | null;
    variation: number | null;
  };
}

interface FunnelStageState {
  value: number | null;
  percentage: number | null;
}

interface PurchasesMadeDataState {
  leads_captured: FunnelStageState;
  purchases_made: FunnelStageState;
}

const createInitialSalesData = (): SalesDataState => ({
  average_order_value: null,
  total_revenue: {
    value: null,
    last_period_value: null,
    variation: null,
  },
});

const createInitialFunnelStage = (): FunnelStageState => ({
  value: null,
  percentage: null,
});

const createInitialPurchasesMadeData = (): PurchasesMadeDataState => ({
  leads_captured: createInitialFunnelStage(),
  purchases_made: createInitialFunnelStage(),
});

export const useHumanSupportSales = defineStore('humanSupportSales', () => {
  const salesData = ref<SalesDataState>(createInitialSalesData());
  const purchasesMadeData = ref<PurchasesMadeDataState>(
    createInitialPurchasesMadeData(),
  );
  const loadingSalesData = ref(false);
  const loadingPurchasesMadeData = ref(false);
  const hasLoadedSalesData = ref(false);
  const hasLoadedPurchasesMadeData = ref(false);

  const isLoadingAllData = computed(
    () => loadingSalesData.value || loadingPurchasesMadeData.value,
  );

  const loadAllData = () => {
    if (hasLoadedSalesData.value) loadSalesData();
    if (hasLoadedPurchasesMadeData.value) loadPurchasesMadeData();
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

  const loadPurchasesMadeData = async () => {
    hasLoadedPurchasesMadeData.value = true;
    try {
      loadingPurchasesMadeData.value = true;
      const data: PurchasesMadeResponse =
        await PurchasesMadeService.getPurchasesMadeData();

      purchasesMadeData.value = {
        leads_captured: {
          value: data.leads_captured.value,
          percentage: data.leads_captured.percentage,
        },
        purchases_made: {
          value: data.purchases_made.value,
          percentage: data.purchases_made.percentage,
        },
      };
    } catch (error) {
      console.error('Error loading purchases made data:', error);
    } finally {
      loadingPurchasesMadeData.value = false;
    }
  };

  return {
    isLoadingAllData,
    salesData,
    purchasesMadeData,
    loadingSalesData,
    loadingPurchasesMadeData,
    loadAllData,
    loadSalesData,
    loadPurchasesMadeData,
  };
});

export type {
  SalesDataState,
  TotalRevenueData,
  PurchasesMadeDataState,
  FunnelStageState,
};
