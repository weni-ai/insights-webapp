import { defineStore, storeToRefs } from 'pinia';

import { useWidgets } from '../widgets';
import {
  CsatResponse,
  NpsResponse,
  SalesFunnelResponse,
} from '@/services/api/resources/conversational/widgets';
import WidgetConversationalService from '@/services/api/resources/conversational/widgets';
import WidgetService from '@/services/api/resources/widgets';
import { CsatOrNpsCardConfig, WidgetType } from '@/models/types/WidgetTypes';
import i18n from '@/utils/plugins/i18n';
import { unnnicCallAlert } from '@weni/unnnic-system';
import { useConversational } from './conversational';

type TypeWidget = 'HUMAN' | 'AI';

interface ConversationalWidgetsState {
  newWidget: WidgetType | null;
  csatWidgetData: CsatResponse | null;
  npsWidgetData: NpsResponse | null;
  salesFunnelWidgetData: SalesFunnelResponse | null;
  isLoadingCsatWidgetData: boolean;
  isLoadingNpsWidgetData: boolean;
  isLoadingSalesFunnelWidgetData: boolean;
  csatWidgetType: TypeWidget;
  npsWidgetType: TypeWidget;
  isFormAi: boolean;
  isFormHuman: boolean;
  isLoadingSaveNewWidget: boolean;
  isLoadingDeleteWidget: boolean;
  isLoadingUpdateWidget: boolean;
  csatWidget: WidgetType | null;
  npsWidget: WidgetType | null;
  salesFunnelWidget: WidgetType | null;
  isCsatWidgetDataError: boolean;
  isNpsWidgetDataError: boolean;
  isSalesFunnelWidgetDataError: boolean;
}

let salesFunnelAbortController: AbortController | null = null;
let csatAbortController: AbortController | null = null;
let npsAbortController: AbortController | null = null;

export const useConversationalWidgets = defineStore('conversationalWidgets', {
  state: (): ConversationalWidgetsState => ({
    newWidget: null,
    csatWidgetData: null,
    npsWidgetData: null,
    salesFunnelWidgetData: null,
    isFormAi: false,
    isFormHuman: false,
    isLoadingCsatWidgetData: false,
    isLoadingNpsWidgetData: false,
    isLoadingSalesFunnelWidgetData: false,
    csatWidgetType: 'AI' as TypeWidget,
    npsWidgetType: 'AI' as TypeWidget,
    isLoadingSaveNewWidget: false,
    isLoadingDeleteWidget: false,
    isLoadingUpdateWidget: false,
    csatWidget: null,
    npsWidget: null,
    salesFunnelWidget: null,
    isCsatWidgetDataError: false,
    isNpsWidgetDataError: false,
    isSalesFunnelWidgetDataError: false,
  }),

  actions: {
    _hasValidConfig(config: CsatOrNpsCardConfig | undefined): boolean {
      if (!config) return false;

      const hasValidAiConfig =
        !!config.datalake_config?.agent_uuid && this.isFormAi;
      const hasValidHumanConfig =
        !!(config.filter?.flow && config.op_field && config.op_field !== '') &&
        this.isFormHuman;

      if (this.isFormAi && this.isFormHuman) {
        return hasValidAiConfig && hasValidHumanConfig;
      }

      return hasValidAiConfig || hasValidHumanConfig;
    },

    _hasConfigChanges(
      dashboardConfig: CsatOrNpsCardConfig | undefined,
      widgetConfig: CsatOrNpsCardConfig | undefined,
    ): boolean {
      if (!dashboardConfig || !widgetConfig) return false;

      const dashboardHasAi = !!dashboardConfig.datalake_config?.agent_uuid;
      const dashboardHasHuman = !!(
        dashboardConfig.filter?.flow &&
        dashboardConfig.op_field &&
        dashboardConfig.op_field !== ''
      );

      const aiConfigChanged =
        dashboardConfig.datalake_config?.agent_uuid !==
        widgetConfig.datalake_config?.agent_uuid;

      const humanConfigChanged =
        dashboardConfig.filter?.flow !== widgetConfig.filter?.flow ||
        dashboardConfig.op_field !== widgetConfig.op_field;

      const aiToggleChanged = dashboardHasAi !== this.isFormAi;
      const humanToggleChanged = dashboardHasHuman !== this.isFormHuman;

      return (
        (this.isFormAi && aiConfigChanged) ||
        (this.isFormHuman && humanConfigChanged) ||
        aiToggleChanged ||
        humanToggleChanged
      );
    },
    setNewWidget(widget: WidgetType | null) {
      this.newWidget = widget;
    },
    resetNewWidget() {
      this.newWidget = null;
    },
    setCsatWidget(widget: WidgetType | null) {
      this.csatWidget = widget;
    },
    setNpsWidget(widget: WidgetType | null) {
      this.npsWidget = widget;
    },
    setIsFormAi(isFormAi: boolean, widgetType?: 'csat' | 'nps' | undefined) {
      this.isFormAi = isFormAi;
      if (!isFormAi && widgetType) {
        const currentWidget =
          widgetType === 'csat' ? this.csatWidget : this.npsWidget;

        if (!currentWidget) return;

        const removedDatalakeConfig = {
          ...currentWidget,
          config: {
            ...currentWidget.config,
            datalake_config: {},
          },
        };

        const setCurrentWidget =
          widgetType === 'csat' ? this.setCsatWidget : this.setNpsWidget;
        setCurrentWidget(removedDatalakeConfig);
      }
    },
    setIsFormHuman(
      isFormHuman: boolean,
      widgetType?: 'csat' | 'nps' | undefined,
    ) {
      this.isFormHuman = isFormHuman;

      if (!isFormHuman && widgetType) {
        const currentWidget =
          widgetType === 'csat' ? this.csatWidget : this.npsWidget;

        if (!currentWidget) return;

        const removedFilter = {
          ...currentWidget,
          config: {
            ...currentWidget.config,
            filter: {},
            op_field: '',
          },
        };

        const setCurrentWidget =
          widgetType === 'csat' ? this.setCsatWidget : this.setNpsWidget;
        setCurrentWidget(removedFilter);
      }
    },
    setCsatWidgetData(data: CsatResponse | null) {
      this.csatWidgetData = data;
    },
    setNpsWidgetData(data: NpsResponse | null) {
      this.npsWidgetData = data;
    },
    setCsatWidgetType(type: TypeWidget) {
      this.csatWidgetType = type;
    },
    setNpsWidgetType(type: TypeWidget) {
      this.npsWidgetType = type;
    },
    async loadSalesFunnelWidgetData() {
      if (salesFunnelAbortController) {
        salesFunnelAbortController.abort();
      }
      salesFunnelAbortController = new AbortController();
      const { signal } = salesFunnelAbortController;

      this.isLoadingSalesFunnelWidgetData = true;
      try {
        const { shouldUseMock } = useConversational();

        if (shouldUseMock) {
          const mockData = await WidgetConversationalService.getSalesFunnelData(
            {},
            { mock: true },
          );
          this.salesFunnelWidgetData = mockData;
          return;
        }

        const { findWidgetBySource } = useWidgets();
        const widgetSalesFunnel = findWidgetBySource(
          'conversations.sales_funnel',
        );

        if (!widgetSalesFunnel) {
          throw new Error('Sales funnel widget not found');
        }

        const salesFunnelData =
          await WidgetConversationalService.getSalesFunnelData(
            { widget_uuid: widgetSalesFunnel.uuid },
            { signal },
          );

        this.salesFunnelWidgetData = salesFunnelData;
      } catch (error) {
        if (signal.aborted) return;
        this.salesFunnelWidgetData = null;
        this.isSalesFunnelWidgetDataError = true;
        console.error('Error loading sales funnel widget data', error);
      } finally {
        if (!signal.aborted) {
          this.isLoadingSalesFunnelWidgetData = false;
        }
      }
    },
    async loadCsatWidgetData() {
      if (csatAbortController) {
        csatAbortController.abort();
      }
      csatAbortController = new AbortController();
      const { signal } = csatAbortController;

      this.isLoadingCsatWidgetData = true;
      try {
        const { shouldUseMock } = useConversational();

        if (shouldUseMock) {
          const mockData = await WidgetConversationalService.getCsatData(
            this.csatWidgetType,
            {},
            { mock: true },
          );
          this.setCsatWidgetData(mockData);
          return;
        }

        const { findWidgetBySource } = useWidgets();
        const widgetCsat = findWidgetBySource('conversations.csat');

        if (!widgetCsat) {
          throw new Error('CSAT widget not found');
        }

        const csatData = await WidgetConversationalService.getCsatData(
          this.csatWidgetType,
          { widget_uuid: widgetCsat.uuid },
          { signal },
        );

        this.setCsatWidgetData(csatData);
        this.isCsatWidgetDataError = false;
      } catch (error) {
        if (signal.aborted) return;
        this.setCsatWidgetData({ results: [] });
        this.isCsatWidgetDataError = true;
        console.error('Error loading CSAT widget data', error);
      } finally {
        if (!signal.aborted) {
          this.isLoadingCsatWidgetData = false;
        }
      }
    },
    async loadNpsWidgetData() {
      if (npsAbortController) {
        npsAbortController.abort();
      }
      npsAbortController = new AbortController();
      const { signal } = npsAbortController;

      this.isLoadingNpsWidgetData = true;
      try {
        const { shouldUseMock } = useConversational();

        if (shouldUseMock) {
          const mockData = await WidgetConversationalService.getNpsData(
            this.npsWidgetType,
            {},
            { mock: true },
          );
          this.setNpsWidgetData(mockData);
          return;
        }

        const { findWidgetBySource } = useWidgets();
        const widgetNps = findWidgetBySource('conversations.nps');

        if (!widgetNps) {
          throw new Error('NPS widget not found');
        }

        const npsData = await WidgetConversationalService.getNpsData(
          this.npsWidgetType,
          { widget_uuid: widgetNps.uuid },
          { signal },
        );

        this.setNpsWidgetData(npsData);
        this.isNpsWidgetDataError = false;
      } catch (error) {
        if (signal.aborted) return;
        this.setNpsWidgetData({ total_responses: 0 });
        this.isNpsWidgetDataError = true;
        console.error('Error loading NPS widget data', error);
      } finally {
        if (!signal.aborted) {
          this.isLoadingNpsWidgetData = false;
        }
      }
    },
    async saveNewWidget() {
      this.isLoadingSaveNewWidget = true;
      try {
        const mapTypes = {
          'conversations.csat': 'csat',
          'conversations.nps': 'nps',
          'conversations.sales_funnel': 'sales_funnel',
        };
        const type = mapTypes[this.newWidget?.source as keyof typeof mapTypes];

        let widget = this.newWidget;

        delete widget.uuid;

        widget.position = [];

        if (!this.isFormAi) {
          delete widget.config.datalake_config;
        }

        if (!this.isFormHuman) {
          delete widget.config.filter;
          delete widget.config.op_field;
        }

        await WidgetService.saveNewWidget(widget);

        this.resetNewWidget();

        const { getCurrentDashboardWidgets } = useWidgets();

        await getCurrentDashboardWidgets();
        if (type === 'nps') {
          this.loadNpsWidgetData();
        }
        if (type === 'csat') {
          this.loadCsatWidgetData();
        }
        if (type === 'sales_funnel') {
          this.loadSalesFunnelWidgetData();
        }

        unnnicCallAlert({
          props: {
            text: i18n.global.t('alert_added', { name: type?.toUpperCase() }),
            type: 'success',
            seconds: 5,
          },
        });
      } catch (error) {
        console.error('Error saving new widget', error);
      } finally {
        this.isLoadingSaveNewWidget = false;
      }
    },
    async updateConversationalWidget(type: 'csat' | 'nps') {
      this.isLoadingUpdateWidget = true;
      try {
        let currentWidget = type === 'csat' ? this.csatWidget : this.npsWidget;

        if (!this.isFormHuman) {
          currentWidget = {
            ...currentWidget,
            config: {
              ...currentWidget.config,
              filter: {},
              op_field: '',
            },
          };
        }

        if (!this.isFormAi) {
          currentWidget = {
            ...currentWidget,
            config: {
              ...currentWidget.config,
              datalake_config: {},
            },
          };
        }

        await WidgetService.updateWidget({
          widget: currentWidget as WidgetType,
        });

        const { getCurrentDashboardWidgets } = useWidgets();
        await getCurrentDashboardWidgets();

        if (type === 'csat') {
          this.loadCsatWidgetData();
        } else {
          this.loadNpsWidgetData();
        }
        unnnicCallAlert({
          props: {
            text: i18n.global.t('alert_edited', { name: type?.toUpperCase() }),
            type: 'success',
            seconds: 5,
          },
        });
      } catch (error) {
        console.error('Error updating widget', error);
      } finally {
        this.isLoadingUpdateWidget = false;
      }
    },
    restoreWidgetsFromDashboard() {
      const { findWidgetBySource } = useWidgets();

      const csatWidget = findWidgetBySource('conversations.csat');
      this.csatWidget = csatWidget ?? null;

      const npsWidget = findWidgetBySource('conversations.nps');
      this.npsWidget = npsWidget ?? null;
    },
    async deleteWidget(type: 'csat' | 'nps' | 'sales_funnel' | 'crosstab') {
      this.isLoadingDeleteWidget = true;
      try {
        const { findWidgetBySource } = useWidgets();
        const sourceMap = {
          csat: 'conversations.csat',
          nps: 'conversations.nps',
          sales_funnel: 'conversations.sales_funnel',
          crosstab: 'conversations.crosstab',
        };

        const widget = findWidgetBySource(sourceMap[type]);

        if (!widget) {
          throw new Error(`${type} widget not found`);
        }

        await WidgetService.deleteWidget(widget.uuid);

        const { getCurrentDashboardWidgets } = useWidgets();
        await getCurrentDashboardWidgets();

        if (type === 'sales_funnel') {
          this.loadSalesFunnelWidgetData();
        }
        if (type === 'nps') {
          this.loadNpsWidgetData();
        }
        if (type === 'csat') {
          this.loadCsatWidgetData();
        }
      } catch (error) {
        console.error('Error deleting widget', error);
      } finally {
        this.isLoadingDeleteWidget = false;
      }
    },
  },

  getters: {
    isEnabledSaveNewWidget: (state) => {
      return !!(
        (state.isFormAi &&
          (state.newWidget?.config as CsatOrNpsCardConfig)?.datalake_config
            .agent_uuid) ||
        (state.isFormHuman &&
          (state.newWidget?.config as CsatOrNpsCardConfig)?.filter.flow &&
          (state.newWidget?.config as CsatOrNpsCardConfig)?.op_field)
      );
    },
    isEnabledUpdateWidgetCsat: (state) => {
      const { findWidgetBySource } = useWidgets();
      const { _hasValidConfig, _hasConfigChanges } = useConversationalWidgets();
      const widgetCsatFromDashboard = findWidgetBySource('conversations.csat');

      if (!widgetCsatFromDashboard || !state.csatWidget) {
        return false;
      }

      const dashboardConfig =
        widgetCsatFromDashboard.config as CsatOrNpsCardConfig;
      const csatWidgetConfig = state.csatWidget.config as CsatOrNpsCardConfig;

      const hasChanges = _hasConfigChanges(dashboardConfig, csatWidgetConfig);

      if (!state.isFormAi && !state.isFormHuman) {
        return hasChanges;
      }

      return _hasValidConfig(csatWidgetConfig) && hasChanges;
    },
    isEnabledUpdateWidgetNps: (state) => {
      const { findWidgetBySource } = useWidgets();
      const { _hasValidConfig, _hasConfigChanges } = useConversationalWidgets();
      const widgetNpsFromDashboard = findWidgetBySource('conversations.nps');

      if (!widgetNpsFromDashboard || !state.npsWidget) {
        return false;
      }

      const dashboardConfig =
        widgetNpsFromDashboard.config as CsatOrNpsCardConfig;
      const npsWidgetConfig = state.npsWidget.config as CsatOrNpsCardConfig;

      const hasChanges = _hasConfigChanges(dashboardConfig, npsWidgetConfig);

      if (!state.isFormAi && !state.isFormHuman) {
        return hasChanges;
      }

      return _hasValidConfig(npsWidgetConfig) && hasChanges;
    },
    getDynamicWidgets: () => {
      const { currentDashboardWidgets } = storeToRefs(useWidgets());
      const types = ['conversations.nps', 'conversations.csat'];

      const isNpsOrCsat = (widget) => types.includes(widget.source);

      return currentDashboardWidgets.value.filter(isNpsOrCsat);
    },

    currentNpsWidget: (state) => {
      const { findWidgetBySource } = useWidgets();
      const widgetNps = findWidgetBySource('conversations.nps');

      return widgetNps
        ? {
            ...widgetNps,
            data: state.npsWidgetData,
          }
        : null;
    },

    currentCsatWidget: (state) => {
      const { findWidgetBySource } = useWidgets();
      const widgetCsat = findWidgetBySource('conversations.csat');

      return widgetCsat
        ? {
            ...widgetCsat,
            data: state.csatWidgetData,
          }
        : null;
    },

    isNpsConfigured: () => {
      return useWidgets().findWidgetBySource('conversations.nps') !== undefined;
    },

    isCsatConfigured: () => {
      return (
        useWidgets().findWidgetBySource('conversations.csat') !== undefined
      );
    },

    isSalesFunnelConfigured: () => {
      return (
        useWidgets().findWidgetBySource('conversations.sales_funnel') !==
        undefined
      );
    },

    isNpsAiConfig: () => {
      const { findWidgetBySource } = useWidgets();
      const widgetNps = findWidgetBySource('conversations.nps');
      const config = widgetNps?.config as CsatOrNpsCardConfig;

      return !!config?.datalake_config?.agent_uuid;
    },

    isNpsHumanConfig: () => {
      const { findWidgetBySource } = useWidgets();
      const widgetNps = findWidgetBySource('conversations.nps');
      const config = widgetNps?.config as CsatOrNpsCardConfig;

      if (config?.filter?.flow && config?.op_field) {
        return true;
      }

      return false;
    },

    isCsatAiConfig: () => {
      const { findWidgetBySource } = useWidgets();
      const widgetCsat = findWidgetBySource('conversations.csat');
      const config = widgetCsat?.config as CsatOrNpsCardConfig;

      return !!config?.datalake_config?.agent_uuid;
    },

    isCsatHumanConfig: () => {
      const { findWidgetBySource } = useWidgets();
      const widgetCsat = findWidgetBySource('conversations.csat');
      const config = widgetCsat?.config as CsatOrNpsCardConfig;

      if (config?.filter?.flow && config?.op_field) {
        return true;
      }

      return false;
    },
  },
});
