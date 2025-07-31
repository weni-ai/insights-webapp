import { defineStore, storeToRefs } from 'pinia';

import { useWidgets } from '../widgets';
import {
  CsatResponse,
  NpsResponse,
} from '@/services/api/resources/conversational/widgets';
import WidgetConversationalService from '@/services/api/resources/conversational/widgets';
import WidgetService from '@/services/api/resources/widgets';
import { CsatOrNpsCardConfig, WidgetType } from '@/models/types/WidgetTypes';

type TypeWidget = 'HUMAN' | 'AI';

interface ConversationalWidgetsState {
  newWidget: WidgetType | null;
  csatWidgetData: CsatResponse | null;
  npsWidgetData: NpsResponse | null;
  isLoadingCsatWidgetData: boolean;
  isLoadingNpsWidgetData: boolean;
  csatWidgetType: TypeWidget;
  npsWidgetType: TypeWidget;
  isFormAi: boolean;
  isFormHuman: boolean;
  isLoadingSaveNewWidget: boolean;
  isLoadingDeleteWidget: boolean;
  isLoadingUpdateWidget: boolean;
  csatWidget: WidgetType | null;
  npsWidget: WidgetType | null;
}

export const useConversationalWidgets = defineStore('conversationalWidgets', {
  state: (): ConversationalWidgetsState => ({
    newWidget: null,
    csatWidgetData: null,
    npsWidgetData: null,
    isFormAi: false,
    isFormHuman: false,
    isLoadingCsatWidgetData: false,
    isLoadingNpsWidgetData: false,
    csatWidgetType: 'AI' as TypeWidget,
    npsWidgetType: 'AI' as TypeWidget,
    isLoadingSaveNewWidget: false,
    isLoadingDeleteWidget: false,
    isLoadingUpdateWidget: false,
    csatWidget: null,
    npsWidget: null,
  }),

  actions: {
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
    setIsFormAi(isFormAi: boolean) {
      this.isFormAi = isFormAi;
    },
    setIsFormHuman(isFormHuman: boolean) {
      this.isFormHuman = isFormHuman;
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
    async loadCsatWidgetData() {
      this.isLoadingCsatWidgetData = true;
      try {
        const { findWidgetBySource } = useWidgets();
        const widgetCsat = findWidgetBySource('conversations.csat');

        if (!widgetCsat) {
          throw new Error('CSAT widget not found');
        }

        const csatData = await WidgetConversationalService.getCsatData(
          this.csatWidgetType,
          {
            widget_uuid: widgetCsat.uuid,
          },
        );

        this.setCsatWidgetData(csatData);
      } catch (error) {
        this.setCsatWidgetData({ results: [] });
        console.error('Error loading CSAT widget data', error);
      } finally {
        this.isLoadingCsatWidgetData = false;
      }
    },
    async loadNpsWidgetData() {
      this.isLoadingNpsWidgetData = true;
      try {
        const { findWidgetBySource } = useWidgets();
        const widgetNps = findWidgetBySource('conversations.nps');

        if (!widgetNps) {
          throw new Error('NPS widget not found');
        }

        const npsData = await WidgetConversationalService.getNpsData(
          this.npsWidgetType,
          {
            widget_uuid: widgetNps.uuid,
          },
        );

        this.setNpsWidgetData(npsData);
      } catch (error) {
        this.setNpsWidgetData({ total_responses: 0 });
        console.error('Error loading NPS widget data', error);
      } finally {
        this.isLoadingNpsWidgetData = false;
      }
    },
    async saveNewWidget() {
      this.isLoadingSaveNewWidget = true;
      try {
        const type =
          this.newWidget?.source === 'conversations.csat' ? 'csat' : 'nps';

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

        if (type === 'csat') {
          this.loadCsatWidgetData();
        } else {
          this.loadNpsWidgetData();
        }
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
      } catch (error) {
        console.error('Error updating widget', error);
      } finally {
        this.isLoadingUpdateWidget = false;
      }
    },

    async deleteWidget(type: 'csat' | 'nps') {
      this.isLoadingDeleteWidget = true;
      try {
        const { findWidgetBySource } = useWidgets();
        const widget =
          type === 'csat'
            ? findWidgetBySource('conversations.csat')
            : findWidgetBySource('conversations.nps');

        if (!widget) {
          throw new Error(`${type} widget not found`);
        }

        await WidgetService.deleteWidget(widget.uuid);

        const { getCurrentDashboardWidgets } = useWidgets();
        await getCurrentDashboardWidgets();

        if (type === 'csat') {
          this.loadCsatWidgetData();
        } else {
          this.loadNpsWidgetData();
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
      return !!(
        (state.csatWidget?.config as CsatOrNpsCardConfig)?.datalake_config
          ?.agent_uuid ||
        ((state.csatWidget?.config as CsatOrNpsCardConfig)?.filter?.flow &&
          (state.csatWidget?.config as CsatOrNpsCardConfig)?.op_field)
      );
    },
    isEnabledUpdateWidgetNps: (state) => {
      return !!(
        ((state.npsWidget?.config as CsatOrNpsCardConfig)?.filter?.flow &&
          (state.npsWidget?.config as CsatOrNpsCardConfig)?.op_field) ||
        (state.npsWidget?.config as CsatOrNpsCardConfig)?.datalake_config
          ?.agent_uuid
      );
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
