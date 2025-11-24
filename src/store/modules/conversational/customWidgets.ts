import { defineStore } from 'pinia';
import { WidgetType } from '@/models/types/WidgetTypes';
import WidgetService from '@/services/api/resources/widgets';
import WidgetConversationalService, {
  CustomWidgetResponse,
} from '@/services/api/resources/conversational/widgets';
import { useWidgets } from '@/store/modules/widgets';
import { unnnicCallAlert } from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';

interface customForm {
  agent_uuid: string;
  agent_name: string;
  key: string;
  widget_uuid: string;
  widget_name: string;
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

export const useCustomWidgets = defineStore('customWidgets', {
  state: () => ({
    customWidgets: [] as customWidget[],
    customForm: {
      agent_uuid: '',
      agent_name: '',
      key: '',
      widget_uuid: '',
      widget_name: '',
    } as customForm,
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
    resetCustomForm() {
      this.customForm = {} as customForm;
    },
    setCustomFormAgent(agent_uuid: string, agent_name: string) {
      this.customForm.agent_uuid = agent_uuid;
      this.customForm.agent_name = agent_name;
    },
    getCustomWidgetByUuid(uuid: string): customWidget | null {
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
    async saveCustomWidget() {
      this.isLoadingSaveNewCustomWidget = true;
      try {
        const widget = {
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

        if (this.customForm.widget_uuid) {
          await WidgetService.updateWidget({
            widget: {
              ...widget,
              uuid: this.customForm.widget_uuid,
            },
          });
        } else {
          await WidgetService.saveNewWidget(widget);
        }

        this.resetCustomForm();

        const { getCurrentDashboardWidgets } = useWidgets();

        await getCurrentDashboardWidgets();

        const alertText = this.customForm.widget_uuid
          ? i18n.global.t('alert_edited', { name: widget.name })
          : i18n.global.t('alert_added', { name: widget.name });

        unnnicCallAlert({
          props: {
            text: alertText,
            type: 'success',
            seconds: 5,
          },
        });
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

      this.loadingByUuid.push(uuid);

      try {
        const response = await WidgetConversationalService.getCustomWidgetData({
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
  },
});
