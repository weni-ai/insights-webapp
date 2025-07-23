import { defineStore } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

export const useConversational = defineStore('conversational', {
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
