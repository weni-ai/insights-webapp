import dashboardsStore from './dashboards';
import { Dashboards, Widgets } from '@/services/api';

import { WidgetType } from '@/models/types/WidgetTypes';
import { isObjectsEquals } from '@/utils/object';
import { mock } from './mock';

const mutations = {
  SET_CURRENT_DASHBOARD_WIDGETS: 'SET_CURRENT_DASHBOARD_WIDGETS',
  SET_LOADING_CURRENT_DASHBOARD_WIDGETS:
    'SET_LOADING_CURRENT_DASHBOARD_WIDGETS',
  SET_LOADING_CURRENT_DASHBOARD_FILTERS:
    'SET_LOADING_CURRENT_DASHBOARD_FILTERS',
  SET_LOADING_CURRENT_EXPANSIVE_WIDGET: 'SET_LOADING_CURRENT_EXPANSIVE_WIDGET',
  RESET_CURRENT_DASHBOARD_WIDGETS: 'RESET_CURRENT_DASHBOARD_WIDGETS',
  SET_CURRENT_DASHBOARD_WIDGET_DATA: 'SET_CURRENT_DASHBOARD_WIDGET_DATA',
  UPDATE_CURRENT_DASHBOARD_WIDGET: 'UPDATE_CURRENT_DASHBOARD_WIDGET',
  UPDATE_CURRENT_WIDGET_EDITING: 'UPDATE_CURRENT_WIDGET_EDITING',
  SET_CURRENT_EXPANSIVE_WIDGET_DATA: 'SET_CURRENT_EXPANSIVE_WIDGET_DATA',
};

export default {
  namespaced: true,
  state: {
    currentDashboardWidgets: [],
    currentExpansiveWidget: {},
    isLoadingCurrentExpansiveWidget: false,
    isLoadingCurrentDashboardWidgets: false,

    currentWidgetEditing: null,
  },
  mutations: {
    [mutations.SET_LOADING_CURRENT_DASHBOARD_WIDGETS](state, loading) {
      state.isLoadingCurrentDashboardWidgets = loading;
    },
    [mutations.SET_LOADING_CURRENT_EXPANSIVE_WIDGET](state, loading) {
      state.isLoadingCurrentExpansiveWidget = loading;
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
    [mutations.SET_CURRENT_EXPANSIVE_WIDGET_DATA](state, widget) {
      console.log('widget', widget);
      if (!widget) {
        state.currentExpansiveWidget = {};
        return;
      }
      state.currentExpansiveWidget = widget;
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
    async getWidgetRecurrenceData({ commit }, { uuid }) {
      try {
        const response: any = await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.state.currentDashboard.uuid,
          widgetUuid: uuid,
          params: {},
        });

        const formattedResponse = response.results;

        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid,
          data: formattedResponse,
        });
      } catch (error) {
        console.error(error);
        commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
          uuid,
          data: [],
        });
      }
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
            percentage: parseFloat(percentage), // Add percentage as a number for sorting
            total: item.title,
          };
        })
        .sort((a, b) => b.percentage - a.percentage);

      commit(mutations.SET_CURRENT_DASHBOARD_WIDGET_DATA, {
        uuid,
        data: formattedResponse,
      });
    },
    async getWidgetVtexOrderData({ commit }, { uuid, utm_source = '' }) {
      try {
        const response: {
          countSell?: string;
          accumulatedTotal?: string;
          medium_ticket?: string;
        } = (await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.state.currentDashboard.uuid,
          widgetUuid: uuid,
          params: {
            utm_source,
          },
        } as any)) as any;

        let formattedResponse = {};

        if (
          !response.countSell &&
          !response.accumulatedTotal &&
          !response.medium_ticket
        ) {
          formattedResponse = {
            orders: '',
            total_value: '',
            average_ticket: '',
          };
        } else {
          formattedResponse = {
            orders: response.countSell,
            total_value: response.accumulatedTotal,
            average_ticket: response.medium_ticket,
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
            total_value: '',
            average_ticket: '',
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
    async updateCurrentExpansiveWidgetData({ commit }, widget) {
      const setWidgetData = (data) =>
        commit(mutations.SET_CURRENT_EXPANSIVE_WIDGET_DATA, {
          ...widget,
          data,
        });

      commit(mutations.SET_LOADING_CURRENT_EXPANSIVE_WIDGET, true);
      setWidgetData(widget);
      try {
        const data = await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.state.currentDashboard.uuid,
          widgetUuid: widget.uuid,
        } as any);

        setWidgetData(
          data
            ? {
                ...data,
                results: mock,
              }
            : null,
        );
        console.log(mock);
      } catch (error) {
        console.error(error);
        setWidgetData(null);
      } finally {
        commit(mutations.SET_LOADING_CURRENT_EXPANSIVE_WIDGET, false);
      }
    },

    updateCurrentExpansiveWidgetLoading({ commit }, loading) {
      commit(mutations.SET_LOADING_CURRENT_EXPANSIVE_WIDGET, loading);
    },
  },
};
