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
  }),

  actions: {
    setNewWidget(widget: WidgetType | null) {
      this.newWidget = widget;
    },
    resetNewWidget() {
      this.newWidget = null;
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
        const { findWidgetBySource } = useWidgets();
        const widget =
          type === 'csat'
            ? findWidgetBySource('conversations.csat')
            : findWidgetBySource('conversations.nps');

        if (!widget) {
          throw new Error(`${type} widget not found`);
        }

        let currentWidget = widget;

        if (!this.isFormHuman) {
          currentWidget = {
            ...widget,
            config: {
              ...widget.config,
              filter: {},
              op_field: '',
            },
          };
        }

        await WidgetService.updateWidget({
          widget: currentWidget,
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
    isEnabledUpdateWidgetCsat: () => {
      const { findWidgetBySource } = useWidgets();
      const widgetCsat = findWidgetBySource('conversations.csat');
      const config = widgetCsat?.config as CsatOrNpsCardConfig;
      if (!widgetCsat) {
        return false;
      }

      return !!(
        config?.datalake_config?.agent_uuid ||
        (config?.filter?.flow && config?.op_field)
      );
    },
    isEnabledUpdateWidgetNps: () => {
      const { findWidgetBySource } = useWidgets();
      const widgetNps = findWidgetBySource('conversations.nps');
      const config = widgetNps?.config as CsatOrNpsCardConfig;

      if (!widgetNps) {
        return false;
      }

      return !!(
        (config?.filter?.flow && config?.op_field) ||
        config?.datalake_config?.agent_uuid
      );
    },
    getDynamicWidgets: () => {
      const { currentDashboardWidgets } = storeToRefs(useWidgets());
      const types = ['conversations.nps', 'conversations.csat'];

      const isNpsOrCsat = (widget) => types.includes(widget.source);

      return currentDashboardWidgets.value.filter(isNpsOrCsat);
    },

    npsWidget: (state) => {
      const { findWidgetBySource } = useWidgets();
      const widgetNps = findWidgetBySource('conversations.nps');

      return widgetNps
        ? {
            ...widgetNps,
            data: state.npsWidgetData,
          }
        : null;
    },

    csatWidget: (state) => {
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
  },
});
