import { defineStore } from 'pinia';
import { WidgetType } from '@/models/types/WidgetTypes';
import WidgetService from '@/services/api/resources/widgets';
import { useWidgets } from '@/store/modules/widgets';

interface customForm {
  agent_uuid: string;
  agent_name: string;
  key: string;
}

export const useCustomWidgets = defineStore('customWidgets', {
  state: () => ({
    customWidgets: [] as WidgetType[],
    customForm: {
      agent_uuid: '',
      agent_name: '',
      key: '',
    } as customForm,
    isLoadingSaveNewCustomWidget: false,
  }),

  actions: {
    setCustomWidgets(customWidgets: WidgetType[]) {
      this.customWidgets = customWidgets;
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
    setCustomFormKey(key: string) {
      this.customForm.key = key;
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
          name: '',
          type: 'custom_widget',
        };

        await WidgetService.saveNewWidget(widget);

        this.resetNewWidget();

        const { getCurrentDashboardWidgets } = useWidgets();

        await getCurrentDashboardWidgets();

        this.resetCustomForm();
      } catch (error) {
        console.error('Error saving new custom widget', error);
      } finally {
        this.isLoadingSaveNewCustomWidget = false;
      }
    },
  },
  getters: {
    getCustomWidgets: (state) => state.customWidgets,
    getCustomForm: (state) => state.customForm,
    getByUuid: (state) => (uuid: string) =>
      state.customWidgets.find((widget) => widget.uuid === uuid),
    isEnabledCreateCustomForm: (state) =>
      state.customForm.agent_uuid?.trim() !== '' &&
      state.customForm.key?.trim() !== '',
  },
});
