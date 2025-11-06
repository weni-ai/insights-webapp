import { defineStore } from 'pinia';
import { WidgetType } from '@/models/types/WidgetTypes';
import WidgetService from '@/services/api/resources/widgets';
import WidgetConversationalService, {
  CustomWidgetResponse,
  CrosstabWidgetResponse,
} from '@/services/api/resources/conversational/widgets';
import { useWidgets } from '@/store/modules/widgets';

interface customForm {
  agent_uuid: string;
  agent_name: string;
  key: string;
  widget_uuid: string;
  widget_name: string;
}

interface crosstabForm {
  widget_uuid: string;
  widget_name: string;
  key_a: string;
  field_name_a: string;
  key_b: string;
  field_name_b: string;
}

interface customWidget extends WidgetType {
  data: CustomWidgetResponse;
  config: {
    datalake_config: {
      agent_uuid: string;
      key: string;
    };
  };
}

interface crosstabWidget extends WidgetType {
  data: CrosstabWidgetResponse;
  config: {
    source_a: { key: string; field_name: string };
    source_b: { key: string; field_name: string };
  };
}

export const useCustomWidgets = defineStore('customWidgets', {
  state: () => ({
    customWidgets: [] as Array<customWidget | crosstabWidget>,
    customForm: {
      agent_uuid: '',
      agent_name: '',
      key: '',
      widget_uuid: '',
      widget_name: '',
    } as customForm,
    crosstabForm: {
      widget_uuid: '',
      widget_name: '',
      key_a: '',
      field_name_a: '',
      key_b: '',
      field_name_b: '',
    } as crosstabForm,
    isLoadingSaveNewCustomWidget: false,
    isLoadingDeleteCustomWidget: false,
    loadingByUuid: [] as string[],
    customWidgetDataErrorByUuid: {} as Record<string, boolean>,
  }),

  actions: {
    setCustomWidgets(customWidgets: WidgetType[]) {
      this.customWidgets = customWidgets;
    },
    updateCustomWidget(uuid: string, data: CustomWidgetResponse) {
      this.customWidgets = this.customWidgets.map((widget) =>
        widget.uuid === uuid ? { ...widget, data: data } : widget,
      );
    },
    setCustomForm(customForm: customForm) {
      this.customForm = customForm;
    },
    setCrosstabForm(crosstabForm: crosstabForm) {
      this.crosstabForm = crosstabForm;
    },
    resetForms() {
      this.customForm = {} as customForm;
      this.crosstabForm = {} as crosstabForm;
    },
    setCustomFormAgent(agent_uuid: string, agent_name: string) {
      this.customForm.agent_uuid = agent_uuid;
      this.customForm.agent_name = agent_name;
    },
    getCustomWidgetByUuid(uuid: string): customWidget | crosstabWidget | null {
      return this.customWidgets.find((widget) => widget.uuid === uuid) || null;
    },
    getIsLoadingByUuid(uuid: string): boolean {
      return this.loadingByUuid.includes(uuid);
    },
    setCustomFormKey(key: string) {
      this.customForm.key = key;
    },
    setCustomFormWidgetName(widget_name: string) {
      this.customForm.widget_name = widget_name;
    },
    _mountCustomWidgetBody() {
      return {
        uuid: this.customForm.widget_uuid || undefined,
        source: 'conversations.custom',
        config: {
          datalake_config: {
            type: 'CUSTOM',
            key: this.customForm.key,
            agent_uuid: this.customForm.agent_uuid,
          },
        },
        position: [],
        report: null,
        is_configurable: true,
        name: this.customForm.widget_name,
        type: 'custom_widget',
      };
    },
    _mountCrosstabWidgetBody() {
      return {
        uuid: this.crosstabForm.widget_uuid || undefined,
        name: this.crosstabForm.widget_name,
        position: [],
        report: null,
        is_configurable: true,
        type: 'conversations.crosstab',
        source: 'conversations.crosstab',
        config: {
          source_a: {
            key: this.crosstabForm.key_a,
            field_name: this.crosstabForm.field_name_a,
          },
          source_b: {
            key: this.crosstabForm.key_b,
            field_name: this.crosstabForm.field_name_b,
          },
        },
      };
    },
    async saveCustomWidget(widgetType: 'custom' | 'crosstab') {
      this.isLoadingSaveNewCustomWidget = true;
      const widgetBodyMap = {
        custom: this._mountCustomWidgetBody(),
        crosstab: this._mountCrosstabWidgetBody(),
      };
      try {
        const widget = widgetBodyMap[widgetType as keyof typeof widgetBodyMap];

        if (widget.uuid) {
          await WidgetService.updateWidget({
            widget,
          });
        } else {
          await WidgetService.saveNewWidget(widget);
        }

        this.resetForms();

        const { getCurrentDashboardWidgets } = useWidgets();

        await getCurrentDashboardWidgets();
      } catch (error) {
        console.error('Error saving new custom widget', error);
      } finally {
        this.isLoadingSaveNewCustomWidget = false;
      }
    },
    async deleteCustomWidget(uuid: string) {
      this.isLoadingDeleteCustomWidget = true;
      try {
        await WidgetService.deleteWidget(uuid);

        const { getCurrentDashboardWidgets } = useWidgets();
        await getCurrentDashboardWidgets();
      } catch (error) {
        console.error('Error deleting widget', error);
      } finally {
        this.isLoadingDeleteCustomWidget = false;
      }
    },
    async loadCustomWidgetData(uuid: string) {
      if (this.loadingByUuid.includes(uuid)) return;

      const widget = this.getCustomWidgetByUuid(uuid);

      if (!widget) return;

      this.loadingByUuid.push(uuid);

      try {
        const sourceMap = {
          'conversations.custom':
            WidgetConversationalService.getCustomWidgetData,
          'conversations.crosstab':
            WidgetConversationalService.getCrosstabWidgetData,
        };
        const dataRequest = sourceMap[widget.source as keyof typeof sourceMap];
        const response = await dataRequest({
          widget_uuid: uuid,
        });
        this.updateCustomWidget(uuid, response);
        this.customWidgetDataErrorByUuid[uuid] = false;
      } catch (error) {
        this.customWidgetDataErrorByUuid[uuid] = true;
        console.error('Error loading custom widget data', error);
      } finally {
        this.loadingByUuid = this.loadingByUuid.filter((id) => id !== uuid);
      }
    },
  },
  getters: {
    getCustomWidgets: (state) => state.customWidgets,
    getCustomForm: (state) => state.customForm,
    isEnabledCreateCustomForm: (state) =>
      state.customForm.agent_uuid?.trim() !== '' &&
      state.customForm.key?.trim() !== '',
    isEnabledSaveCrosstabForm: (state) =>
      state.crosstabForm.widget_name?.trim() !== '' &&
      state.crosstabForm.key_a?.trim() !== '' &&
      state.crosstabForm.key_b?.trim() !== '',
  },
});
