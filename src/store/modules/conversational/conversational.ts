import { defineStore } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useConversationalTopics } from './topics';
import { useConversationalWidgets } from './widgets';
import { useCustomWidgets } from './customWidgets';
import { useAutoWidgets } from './autoWidgets';

export type DrawerWidgetType =
  | 'nps'
  | 'csat'
  | 'add'
  | 'custom'
  | 'sales_funnel'
  | 'crosstab'
  | 'absolute_numbers'
  | null;
type EndpointErrorKey = 'topics' | 'header' | 'widgets' | 'contacts';

interface ConversationalState {
  isDrawerCustomizableOpen: boolean;
  drawerWidgetType: DrawerWidgetType;
  isNewDrawerCustomizable: boolean;
  refreshDataConversational: boolean;
  isConfigurationLoaded: boolean;
  hasEndpointData: boolean;
  isloadingConversationalData: {
    header: boolean;
    contactsHeader: boolean;
    mostTalkedAboutTopics: boolean;
    dynamicWidgets: boolean;
  };
  endpointErrors: Record<EndpointErrorKey, boolean>;
}

export const useConversational = defineStore('conversational', {
  state: (): ConversationalState => ({
    isDrawerCustomizableOpen: false,
    drawerWidgetType: null as DrawerWidgetType,
    isNewDrawerCustomizable: false,
    refreshDataConversational: false,
    isConfigurationLoaded: false,
    hasEndpointData: false,
    isloadingConversationalData: {
      header: false,
      contactsHeader: false,
      mostTalkedAboutTopics: false,
      dynamicWidgets: false,
    },
    endpointErrors: {
      topics: false,
      header: false,
      widgets: false,
      contacts: false,
    },
  }),

  actions: {
    setIsDrawerCustomizableOpen(
      isDrawerCustomizableOpen: boolean,
      type: DrawerWidgetType,
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
      key:
        | 'header'
        | 'contactsHeader'
        | 'mostTalkedAboutTopics'
        | 'dynamicWidgets',
      value: boolean,
    ) {
      this.isloadingConversationalData[key] = value;
    },
    setConfigurationLoaded(value: boolean) {
      this.isConfigurationLoaded = value;
    },
    setHasEndpointData(value: boolean) {
      this.hasEndpointData = value;
    },
    setEndpointError(key: EndpointErrorKey, value: boolean) {
      this.endpointErrors[key] = value;
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

    hasEndpointErrors: (state) =>
      Object.values(state.endpointErrors).some(Boolean),

    shouldUseMock: (state) => {
      if (!state.isConfigurationLoaded) return false;

      const hasErrors = Object.values(state.endpointErrors).some(Boolean);
      if (hasErrors) return false;

      if (state.hasEndpointData) return false;

      const { hasExistingTopics } = useConversationalTopics();
      const { isCsatConfigured, isNpsConfigured, isSalesFunnelConfigured } =
        useConversationalWidgets();
      const { getRealCustomWidgets } = useCustomWidgets();
      const { hasAgentInvocationData, hasToolResultData } = useAutoWidgets();

      const hasAnyConfiguration =
        hasExistingTopics ||
        isCsatConfigured ||
        isNpsConfigured ||
        isSalesFunnelConfigured ||
        getRealCustomWidgets.length > 0 ||
        hasAgentInvocationData ||
        hasToolResultData;

      return !hasAnyConfiguration;
    },
  },
});
