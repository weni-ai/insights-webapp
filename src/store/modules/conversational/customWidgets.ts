import { defineStore } from 'pinia';
import { WidgetType } from '@/models/types/WidgetTypes';
import WidgetService from '@/services/api/resources/widgets';
import WidgetConversationalService, {
  CustomWidgetResponse,
  CrosstabWidgetResponse,
} from '@/services/api/resources/conversational/widgets';
import {
  getMockCustomWidgetData,
  getMockCrosstabWidgetData,
} from '@/services/api/resources/conversational/mocks';
import { useWidgets } from '@/store/modules/widgets';
import { unnnicCallAlert } from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';

export const MOCK_CUSTOM_UUID = 'mock-custom';
export const MOCK_CROSSTAB_UUID = 'mock-crosstab';

const abortControllersByUuid = new Map<string, AbortController>();

interface customForm {
  agent_uuid: string;
  agent_name: string;
  key: string;
  widget_uuid: string;
  widget_name: string;
}

interface crosstabForm {
  reference_field: string;
  widget_uuid: string;
  widget_name: string;
  key_a: string;
  field_name_a: string;
  key_b: string;
  field_name_b: string;
}

export interface absoluteNumbersFormChildren {
  uuid?: string;
  name: string;
  parent?: string;
  config: {
    index: number;
    agent_uuid: string;
    key: string;
    operation: string;
    value_field_name: string;
    currency: {
      is_active: boolean;
      code: string | null;
    };
  };
}

interface absoluteNumbersForm {
  widget_uuid: string;
  name: string;
  children: absoluteNumbersFormChildren[];
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
      reference_field: '',
      widget_uuid: '',
      widget_name: '',
      key_a: '',
      field_name_a: '',
      key_b: '',
      field_name_b: '',
    } as crosstabForm,
    absoluteNumbersFormChildToScroll: null as string | null,
    absoluteNumbersForm: {
      widget_uuid: '',
      name: '',
      children: [],
    } as absoluteNumbersForm,
    isLoadingSaveNewCustomWidget: false,
    isLoadingDeleteCustomWidget: false,
    loadingByUuid: [] as string[],
    customWidgetDataErrorByUuid: {} as Record<string, boolean | number>,
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
      this.absoluteNumbersForm = {} as absoluteNumbersForm;
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
          reference_field: this.crosstabForm.reference_field,
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
    _mountAbsoluteNumbersWidgetBody() {
      return {
        uuid: this.absoluteNumbersForm.widget_uuid || undefined,
        name: this.absoluteNumbersForm.name,
        type: 'conversations.absolute_numbers',
        source: 'conversations.absolute_numbers',
        position: [],
      };
    },
    _mountAbsoluteNumbersWidgetBodyChildren(parent: string) {
      return this.absoluteNumbersForm.children.map((child, index) => ({
        uuid: child.uuid || undefined,
        name: child.name,
        parent,
        type: 'conversations.absolute_numbers_child',
        source: 'conversations.absolute_numbers.child',
        config: { ...child.config, index: index + 1 },
      }));
    },
    _makeAbsoluteNumbersChildRequest(children) {
      const childrenRequests = children.map((child) => {
        if (child.uuid) {
          return WidgetService.updateWidget({
            widget: child,
          });
        } else {
          return WidgetService.saveNewWidget(child);
        }
      });
      return childrenRequests;
    },
    async saveAbsoluteNumbers() {
      this.isLoadingSaveNewAbsoluteNumbersWidget = true;
      try {
        const widget = this._mountAbsoluteNumbersWidgetBody();

        if (widget.uuid) {
          await WidgetService.updateWidget({
            widget,
          });
        } else {
          const createdWidget = (await WidgetService.saveNewWidget(
            widget,
          )) as unknown as WidgetType;
          widget.uuid = createdWidget.uuid;
        }

        const children = this._mountAbsoluteNumbersWidgetBodyChildren(
          widget.uuid,
        );

        const childrenRequests =
          this._makeAbsoluteNumbersChildRequest(children);

        await Promise.all(childrenRequests);

        this.resetForms();

        const { getCurrentDashboardWidgets } = useWidgets();

        await getCurrentDashboardWidgets();

        const alertText = this.absoluteNumbersForm.widget_uuid
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
        console.error('Error saving absolute numbers widget', error);
      } finally {
        this.isLoadingSaveNewAbsoluteNumbersWidget = false;
      }
    },
    injectMockWidgets() {
      const hasMockCustom = this.customWidgets.some(
        (w) => w.uuid === MOCK_CUSTOM_UUID,
      );
      if (hasMockCustom) return;

      const mockBase = {
        grid_position: {
          column_start: 0,
          column_end: 0,
          row_start: 0,
          row_end: 0,
        },
        report: null,
        is_configurable: false,
      };

      this.customWidgets.push(
        {
          ...mockBase,
          uuid: MOCK_CUSTOM_UUID,
          name: i18n.global.t(
            'conversations_dashboard.mock.custom_widget_title',
          ),
          source: 'conversations.custom',
          type: 'conversations.custom',
          data: getMockCustomWidgetData(),
          config: { datalake_config: { agent_uuid: '', key: '' } },
        } as unknown as customWidget,
        {
          ...mockBase,
          uuid: MOCK_CROSSTAB_UUID,
          name: i18n.global.t(
            'conversations_dashboard.mock.crosstab_widget_title',
          ),
          source: 'conversations.crosstab',
          type: 'conversations.crosstab',
          data: getMockCrosstabWidgetData(),
          config: {
            source_a: { key: '', field_name: '' },
            source_b: { key: '', field_name: '' },
          },
        } as unknown as crosstabWidget,
      );
    },
    clearMockWidgets() {
      this.customWidgets = this.customWidgets.filter(
        (w) => w.uuid !== MOCK_CUSTOM_UUID && w.uuid !== MOCK_CROSSTAB_UUID,
      );
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
      const existingController = abortControllersByUuid.get(uuid);
      if (existingController) {
        existingController.abort();
      }
      const controller = new AbortController();
      abortControllersByUuid.set(uuid, controller);
      const { signal } = controller;

      const widget = this.getCustomWidgetByUuid(uuid);

      if (!widget) return;

      if (!this.loadingByUuid.includes(uuid)) {
        this.loadingByUuid.push(uuid);
      }

      try {
        const sourceMap = {
          'conversations.custom':
            WidgetConversationalService.getCustomWidgetData,
          'conversations.crosstab':
            WidgetConversationalService.getCrosstabWidgetData,
        };
        const dataRequest = sourceMap[widget.source as keyof typeof sourceMap];
        const response = await dataRequest({ widget_uuid: uuid }, { signal });
        this.updateCustomWidget(uuid, response);
        this.customWidgetDataErrorByUuid[uuid] = false;
      } catch (error) {
        if (signal.aborted) return;
        this.customWidgetDataErrorByUuid[uuid] = error.status || true;
        console.error('Error loading custom widget data', error);
      } finally {
        if (!signal.aborted) {
          this.loadingByUuid = this.loadingByUuid.filter((id) => id !== uuid);
          abortControllersByUuid.delete(uuid);
        }
      }
    },
  },
  getters: {
    getCustomWidgets: (state) => state.customWidgets,
    getRealCustomWidgets: (state) =>
      state.customWidgets.filter(
        (w) => w.uuid !== MOCK_CUSTOM_UUID && w.uuid !== MOCK_CROSSTAB_UUID,
      ),
    getCustomForm: (state) => state.customForm,
    isEnabledCreateCustomForm: (state) =>
      state.customForm.agent_uuid?.trim() !== '' &&
      state.customForm.key?.trim() !== '',
    isEnabledSaveCrosstabForm: (state) =>
      state.crosstabForm.widget_name?.trim() !== '' &&
      state.crosstabForm.key_a?.trim() !== '' &&
      state.crosstabForm.key_b?.trim() !== '',
    isEnabledSaveAbsoluteNumbersForm: (state) => {
      const validWidgetName = state.absoluteNumbersForm.name?.trim() !== '';
      const validChildren = state.absoluteNumbersForm.children.every(
        (child) => {
          return (
            child.name?.trim() !== '' &&
            child.config.agent_uuid?.trim() !== '' &&
            child.config.key?.trim() !== '' &&
            child.config.operation?.trim() !== ''
          );
        },
      );
      return validWidgetName && validChildren;
    },
  },
});
