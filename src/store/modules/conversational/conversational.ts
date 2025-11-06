import { defineStore } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

export const useConversational = defineStore('conversational', {
  state: () => ({
    isDrawerCustomizableOpen: false,
    drawerWidgetType: null as
      | 'nps'
      | 'csat'
      | 'add'
      | 'custom'
      | 'crosstab'
      | null,
    isNewDrawerCustomizable: false,
  }),

  actions: {
    setIsDrawerCustomizableOpen(
      isDrawerCustomizableOpen: boolean,
      type:
        | 'nps'
        | 'csat'
        | 'add'
        | 'custom'
        | 'sales_funnel'
        | 'crosstab'
        | null,
      isNew: boolean,
    ) {
      this.isDrawerCustomizableOpen = isDrawerCustomizableOpen;
      this.drawerWidgetType = type;
      this.isNewDrawerCustomizable = isNew;
    },
  },
  getters: {
    appliedFilters: () => {
      const { appliedFilters } = useDashboards();

      const { ended_at } =
        (appliedFilters as {
          ended_at: { __gte: string; __lte: string };
        }) || {};

      const { __gte, __lte } =
        (ended_at as {
          __gte: string;
          __lte: string;
        }) || {};

      const formattedAppliedFilters = {
        start_date: __gte,
        end_date: __lte,
      };

      return formattedAppliedFilters;
    },
  },
});
