import { defineStore } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

export type DrawerWidgetType =
  | 'nps'
  | 'csat'
  | 'add'
  | 'custom'
  | 'sales_funnel'
  | null;
interface ConversationalState {
  isDrawerCustomizableOpen: boolean;
  drawerWidgetType: DrawerWidgetType;
  isNewDrawerCustomizable: boolean;
  refreshDataConversational: boolean;
  isloadingConversationalData: {
    header: boolean;
    mostTalkedAboutTopics: boolean;
    dynamicWidgets: boolean;
  };
}

export const useConversational = defineStore('conversational', {
  state: (): ConversationalState => ({
    isDrawerCustomizableOpen: false,
    drawerWidgetType: null as
      | 'nps'
      | 'csat'
      | 'add'
      | 'custom'
      | 'crosstab'
      | null,
    isNewDrawerCustomizable: false,
    refreshDataConversational: false,
    isloadingConversationalData: {
      header: false,
      mostTalkedAboutTopics: false,
      dynamicWidgets: false,
    },
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
    setRefreshDataConversational(value: boolean) {
      this.refreshDataConversational = value;
    },
    setIsLoadingConversationalData(
      key: 'header' | 'mostTalkedAboutTopics' | 'dynamicWidgets',
      value: boolean,
    ) {
      this.isloadingConversationalData[key] = value;
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
    isLoadingConversationalData: (state: ConversationalState) => {
      return Object.values(state.isloadingConversationalData).some(
        (value) => value,
      );
    },
  },
});
