import { defineStore } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

export const useConversational = defineStore('conversational', {
  state: () => ({
    isDrawerCsatOrNpsOpen: false,
    drawerWidgetType: null as 'nps' | 'csat' | 'add' | null,
    isNewDrawerCsatOrNps: false,
  }),

  actions: {
    setIsDrawerCsatOrNpsOpen(
      isDrawerCsatOrNpsOpen: boolean,
      type: 'nps' | 'csat' | 'add' | null,
      isNew: boolean,
    ) {
      this.isDrawerCsatOrNpsOpen = isDrawerCsatOrNpsOpen;
      this.drawerWidgetType = type;
      this.isNewDrawerCsatOrNps = isNew;
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
