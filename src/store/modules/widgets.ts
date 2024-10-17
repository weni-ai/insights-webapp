import dashboardsStore from './dashboards';
import { Dashboards, Widgets } from '@/services/api';
import { getWidgetMockData } from '@/services/api/resources/api-phatom';

import { WidgetType } from '@/models/types/WidgetTypes';
import { isObjectsEquals } from '@/utils/object';

const mutations = {
  SET_CURRENT_DASHBOARD_WIDGETS: 'SET_CURRENT_DASHBOARD_WIDGETS',
  SET_LOADING_CURRENT_DASHBOARD_WIDGETS:
    'SET_LOADING_CURRENT_DASHBOARD_WIDGETS',
  SET_LOADING_CURRENT_DASHBOARD_FILTERS:
    'SET_LOADING_CURRENT_DASHBOARD_FILTERS',
  RESET_CURRENT_DASHBOARD_WIDGETS: 'RESET_CURRENT_DASHBOARD_WIDGETS',
  SET_CURRENT_DASHBOARD_WIDGET_DATA: 'SET_CURRENT_DASHBOARD_WIDGET_DATA',
  UPDATE_CURRENT_DASHBOARD_WIDGET: 'UPDATE_CURRENT_DASHBOARD_WIDGET',
  UPDATE_CURRENT_WIDGET_EDITING: 'UPDATE_CURRENT_WIDGET_EDITING',
};

import i18n from '@/utils/plugins/i18n';

export default {
  namespaced: true,
  state: {
    currentDashboardWidgets: [],
    isLoadingCurrentDashboardWidgets: false,

    currentWidgetEditing: null,
  },
  mutations: {
    [mutations.SET_LOADING_CURRENT_DASHBOARD_WIDGETS](state, loading) {
      state.isLoadingCurrentDashboardWidgets = loading;
    },
    [mutations.SET_CURRENT_DASHBOARD_WIDGETS](state, widgets) {
      state.currentDashboardWidgets = widgets;
    },
    [mutations.RESET_CURRENT_DASHBOARD_WIDGETS](state) {
      state.currentDashboardWidgets = [];
    },
    [mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA](state, { uuid, data }) {
      const widgetIndex = state.currentDashboardWidgets.findIndex(
        (widget) => widget.uuid === uuid,
      );
      const isValidWidgetIndex = widgetIndex !== -1;

      if (isValidWidgetIndex) {
        state.currentDashboardWidgets[widgetIndex] = {
          ...state.currentDashboardWidgets[widgetIndex],
          data,
        };
      }
    },
    [mutations.UPDATE_CURRENT_DASHBOARD_WIDGET](state, widget) {
      const widgetIndex = state.currentDashboardWidgets.findIndex(
        (mappedWidget) => mappedWidget.uuid === widget.uuid,
      );

      state.currentDashboardWidgets[widgetIndex] = widget;
    },
    [mutations.UPDATE_CURRENT_WIDGET_EDITING](state, widget) {
      if (isObjectsEquals(state.currentWidgetEditing, widget)) return;
      state.currentWidgetEditing = widget;
    },
  },
  actions: {
    async getCurrentDashboardWidgets({ commit }) {
      commit(mutations.SET_LOADING_CURRENT_DASHBOARD_WIDGETS, true);
      const widgets = await Dashboards.getDashboardWidgets(
        dashboardsStore.state.currentDashboard.uuid,
      );
      commit(mutations.SET_CURRENT_DASHBOARD_WIDGETS, widgets);
      commit(mutations.SET_LOADING_CURRENT_DASHBOARD_WIDGETS, false);
    },
    async getCurrentDashboardWidgetData({ commit }, widget) {
      const { uuid, name } = widget;
      const setWidgetData = (data) =>
        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid,
          data,
        });

      if (!name) {
        /* This only checking if the name is not defined, since the widget may be unconfigured,
          but still have empty fields in the "config" object. */
        setWidgetData(null);
        return;
      }

      try {
        const data = await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.state.currentDashboard.uuid,
          widgetUuid: uuid,
        } as any);
        setWidgetData(data);
      } catch (error) {
        console.error(error);
        setWidgetData(null);
      }
    },
    async getCurrentDashboardWidgetsDatas({ state, dispatch }) {
      Promise.all(
        state.currentDashboardWidgets.map(async (widget) => {
          const { name, config } = widget;

          if (name && Object.keys(config).length) {
            dispatch('getCurrentDashboardWidgetData', widget);
          }
        }),
      );
    },
    async getWidgetGraphFunnelData({ commit }, { uuid, widgetFunnelConfig }) {
      const fetchData = async (metric) => {
        const { name } = widgetFunnelConfig[metric];
        const { value }: any = await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.state.currentDashboard.uuid,
          widgetUuid: uuid,
          params: { slug: metric },
        });
        return { description: name, title: value };
      };

      const response = await Promise.all(
        Object.keys(widgetFunnelConfig).map(fetchData),
      );

      const totalValue = response.reduce((sum, item) => sum + item.title, 0);
      const formattedResponse = response
        .map((item) => {
          const percentage = ((item.title / totalValue) * 100 || 0).toFixed(2);
          return {
            description: item.description,
            title: `${parseFloat(percentage).toLocaleString(
              i18n.global.locale || 'en-US',
              {
                minimumFractionDigits: 2,
              },
            )}% (${item.title.toLocaleString(i18n.global.locale || 'en-US')})`,
            percentage: parseFloat(percentage), // Add percentage as a number for sorting
          };
        })
        .sort((a, b) => b.percentage - a.percentage)
        .map(({ description, title }) => ({ description, title })); // Remove the 'percentage' property

      commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
        uuid,
        data: formattedResponse,
      });
    },
    async getWidgetVtexOrderData({ commit }, { uuid }) {
      try {
        const response: {
          countSell?: string;
          accumulatedTotal?: string;
          medium_ticket?: string;
        } = (await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.state.currentDashboard.uuid,
          widgetUuid: uuid,
        } as any)) as any;

        let formattedResponse = {};

        if (
          !response.countSell &&
          !response.accumulatedTotal &&
          !response.medium_ticket
        ) {
          formattedResponse = {
            orders: '',
            average_ticket: '',
            total_value: '',
          };
        } else {
          formattedResponse = {
            orders: response.countSell,
            average_ticket: response.medium_ticket,
            total_value: response.accumulatedTotal,
          };
        }

        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid,
          data: formattedResponse,
        });
      } catch (error) {
        console.error(error);
        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid,
          data: {
            orders: '',
            average_ticket: '',
            total_value: '',
          },
        });
      }
    },

    updateCurrentWidgetEditing({ commit }, widget) {
      commit(mutations.UPDATE_CURRENT_WIDGET_EDITING, widget);
    },

    updateCurrentWidgetEditingConfig({ state, commit }, config) {
      commit(mutations.UPDATE_CURRENT_WIDGET_EDITING, {
        ...state.currentWidgetEditing,
        config,
      });
    },

    async updateWidget({ commit }, widget: WidgetType) {
      await Widgets.updateWidget({
        widget,
      });
      commit(mutations.UPDATE_CURRENT_DASHBOARD_WIDGET, widget);
    },
  },
};
