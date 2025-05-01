import { defineStore } from 'pinia';
import { useDashboards } from './dashboards';
import { Dashboards, Widgets } from '@/services/api';

import { WidgetType } from '@/models/types/WidgetTypes';
import { isObjectsEquals } from '@/utils/object';

export const useWidgets = defineStore('widgets', {
  state: () => ({
    currentDashboardWidgets: [],
    currentExpansiveWidget: {},
    currentExpansiveWidgetFilters: {
      sector: '',
      queue: '',
    },
    isLoadingCurrentExpansiveWidget: false,
    isLoadingCurrentDashboardWidgets: false,
    currentWidgetEditing: null,
  }),
  actions: {
    resetCurrentDashboardWidgets() {
      this.currentDashboardWidgets = [];
    },
    async getCurrentDashboardWidgets() {
      const dashboardsStore = useDashboards();
      this.isLoadingCurrentDashboardWidgets = true;
      const widgets = await Dashboards.getDashboardWidgets(
        dashboardsStore.currentDashboard.uuid,
      );
      this.currentDashboardWidgets = widgets;
      this.isLoadingCurrentDashboardWidgets = false;
    },
    setWidgetData({ uuid, data }) {
      const widgetIndex = this.currentDashboardWidgets.findIndex(
        (widget) => widget.uuid === uuid,
      );
      const isValidWidgetIndex = widgetIndex !== -1;

      if (isValidWidgetIndex) {
        this.currentDashboardWidgets[widgetIndex] = {
          ...this.currentDashboardWidgets[widgetIndex],
          data,
        };
      }
    },
    async getCurrentDashboardWidgetData(widget) {
      const dashboardsStore = useDashboards();
      const { uuid, name } = widget;

      if (!name) {
        /* This only checking if the name is not defined, since the widget may be unconfigured,
          but still have empty fields in the "config" object. */
        this.setWidgetData(null);
        return;
      }

      try {
        const data = await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.currentDashboard.uuid,
          widgetUuid: uuid,
        } as any);

        this.setWidgetData(data);
      } catch (error) {
        console.error(error);
        if (widget.type === 'vtex_conversions') {
          this.setWidgetData({ error: true });
        } else {
          this.setWidgetData(null);
        }
      }
    },
    async getCurrentDashboardWidgetsDatas() {
      Promise.all(
        this.currentDashboardWidgets.map(async (widget) => {
          const { name, config } = widget;

          if (name && Object.keys(config).length) {
            this.getCurrentDashboardWidgetData(widget);
          }
        }),
      );
    },
    async getWidgetRecurrenceData({ uuid }) {
      const dashboardsStore = useDashboards();
      try {
        const response: any = await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.currentDashboard.uuid,
          widgetUuid: uuid,
          params: {},
        });

        const formattedResponse = response.results;

        this.setWidgetData({ uuid, data: formattedResponse });
      } catch (error) {
        console.error(error);
        this.setWidgetData({ uuid, data: [] });
      }
    },
    async getWidgetGraphFunnelData({ uuid, widgetFunnelConfig }) {
      const dashboardsStore = useDashboards();

      const fetchData = async (metric) => {
        const { name } = widgetFunnelConfig[metric];
        const { value }: any = await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.currentDashboard.uuid,
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

      this.setWidgetData({ uuid, data: formattedResponse });
    },
    async getWidgetVtexOrderData({ uuid, utm_source = '' }) {
      const dashboardsStore = useDashboards();
      try {
        const response: {
          countSell?: string;
          accumulatedTotal?: string;
          medium_ticket?: string;
        } = (await Dashboards.getDashboardWidgetData({
          dashboardUuid: dashboardsStore.currentDashboard.uuid,
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

        this.setWidgetData({ uuid, data: formattedResponse });
      } catch (error) {
        console.error(error);
        this.setWidgetData({
          uuid,
          data: {
            orders: '',
            total_value: '',
            average_ticket: '',
          },
        });
      }
    },
    updateCurrentWidgetEditing(widget) {
      if (isObjectsEquals(this.currentWidgetEditing, widget)) return;
      this.currentWidgetEditing = widget;
    },
    updateCurrentWidgetEditingConfig(config) {
      const treatedWidget = { ...this.currentWidgetEditing, config };
      if (isObjectsEquals(this.currentWidgetEditing, treatedWidget)) return;
      this.currentWidgetEditing = treatedWidget;
    },
    async updateWidget(widget: WidgetType) {
      await Widgets.updateWidget({
        widget,
      });
      const widgetIndex = this.currentDashboardWidgets.findIndex(
        (mappedWidget) => mappedWidget.uuid === widget.uuid,
      );
      this.currentDashboardWidgets[widgetIndex] = widget;
    },
    setCurrentExpansiveData(widget) {
      if (!widget) {
        this.currentExpansiveWidget = {};
        return;
      }
      this.currentExpansiveWidget = widget;
    },
    async updateCurrentExpansiveWidgetData(widget) {
      this.isLoadingCurrentExpansiveWidget = true;
      this.setCurrentExpansiveData(widget);
      try {
        const customParams: { sector?: string; queue?: string } = {};

        if (this.currentExpansiveWidgetFilters.sector) {
          customParams.sector = this.currentExpansiveWidgetFilters.sector;
        }

        if (this.currentExpansiveWidgetFilters.queue) {
          customParams.queue = this.currentExpansiveWidgetFilters.queue;
        }

        const data = await Dashboards.getCustomStatusData({
          params: customParams,
        });
        this.setCurrentExpansiveData(data);
      } catch (error) {
        console.error('getCustomStatusData', error);
        this.setCurrentExpansiveData(null);
      } finally {
        this.isLoadingCurrentExpansiveWidget = false;
      }
    },
    updateCurrentExpansiveWidgetFilters(filters) {
      this.currentExpansiveWidgetFilters = {
        ...this.currentExpansiveWidgetFilters,
        ...filters,
      };
    },
    resetCurrentExpansiveWidgetFilters() {
      this.currentExpansiveWidgetFilters = {
        sector: '',
        queue: '',
      };
    },
    updateCurrentExpansiveWidgetLoading(loading) {
      this.isLoadingCurrentExpansiveWidget = loading;
    },
  },
});
