import { useDashboards } from './dashboards';
import { Dashboards, Widgets } from '@/services/api';

import { WidgetType } from '@/models/types/WidgetTypes';
import { isObjectsEquals } from '@/utils/object';
import { defineStore } from 'pinia';
import { useConversationalWidgets } from './conversational/widgets';

export const useWidgets = defineStore('widgets', {
  state: () => ({
    currentDashboardWidgets: [],
    currentExpansiveWidget: {},
    currentExpansiveWidgetFilters: {
      sector: '',
      queue: '',
      date: { start: '', end: '' },
    },
    isLoadingCurrentExpansiveWidget: false,
    isLoadingCurrentDashboardWidgets: false,

    currentWidgetEditing: null,
  }),
  actions: {
    setLoadingCurrentDashboardWidgets(loading: boolean) {
      this.isLoadingCurrentDashboardWidgets = loading;
    },

    setLoadingCurrentExpansiveWidget(loading: boolean) {
      this.isLoadingCurrentExpansiveWidget = loading;
    },

    setCurrentDashboardWidgets(widgets: any[]) {
      this.currentDashboardWidgets = widgets;
    },

    resetCurrentDashboardWidgets() {
      this.currentDashboardWidgets = [];
    },

    setCurrentDashboardWidgetData({ uuid, data }: { uuid: string; data: any }) {
      const widgetIndex = this.currentDashboardWidgets.findIndex(
        (widget) => widget.uuid === uuid,
      );
      if (widgetIndex !== -1) {
        this.currentDashboardWidgets[widgetIndex] = {
          ...this.currentDashboardWidgets[widgetIndex],
          data,
        };
      }
    },

    updateCurrentDashboardWidget(widget: any) {
      const widgetIndex = this.currentDashboardWidgets.findIndex(
        (mappedWidget) => mappedWidget.uuid === widget.uuid,
      );
      if (widgetIndex !== -1) {
        this.currentDashboardWidgets[widgetIndex] = widget;
      }
    },

    async updateCurrentWidgetEditing(widget: any) {
      if (isObjectsEquals(this.currentWidgetEditing, widget)) return;
      this.currentWidgetEditing = widget;
    },

    setCurrentExpansiveWidgetData(widget: any) {
      this.currentExpansiveWidget = widget || {};
    },

    setCurrentExpansiveWidgetFilters(filters: { [key: string]: string }) {
      this.currentExpansiveWidgetFilters = {
        ...this.currentExpansiveWidgetFilters,
        ...filters,
      };
    },

    resetCurrentExpansiveWidgetsFilters() {
      this.currentExpansiveWidgetFilters = {
        sector: '',
        queue: '',
      };
    },

    async getCurrentDashboardWidgets() {
      this.setLoadingCurrentDashboardWidgets(true);

      const widgets = await Dashboards.getDashboardWidgets(
        useDashboards().currentDashboard.uuid,
      );
      this.setCurrentDashboardWidgets(widgets);

      if (widgets.length > 0) {
        const { setCsatWidget, setNpsWidget } = useConversationalWidgets();
        const csatWidget = widgets.find(
          (widget) => widget.source === 'conversations.csat',
        );
        const npsWidget = widgets.find(
          (widget) => widget.source === 'conversations.nps',
        );
        if (csatWidget) {
          setCsatWidget(csatWidget);
        }
        if (npsWidget) {
          setNpsWidget(npsWidget);
        }
      }

      this.setLoadingCurrentDashboardWidgets(false);
    },

    async getCurrentDashboardWidgetData(widget) {
      const { uuid, name } = widget;
      const setWidgetData = (data) =>
        this.setCurrentDashboardWidgetData({ uuid, data });

      if (!name) {
        /* This only checking if the name is not defined, since the widget may be unconfigured,
          but still have empty fields in the "config" object. */
        setWidgetData(null);
        return;
      }

      try {
        const data = await Dashboards.getDashboardWidgetData({
          dashboardUuid: useDashboards().currentDashboard.uuid,
          widgetUuid: uuid,
        } as any);

        setWidgetData(data);
      } catch (error) {
        console.error(error);
        if (widget.type === 'vtex_conversions') setWidgetData({ error: true });
        else setWidgetData(null);
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
      try {
        const response: any = await Dashboards.getDashboardWidgetData({
          dashboardUuid: useDashboards().currentDashboard.uuid,
          widgetUuid: uuid,
          params: {},
        });

        const formattedResponse = response.results;

        this.setCurrentDashboardWidgetData({ uuid, data: formattedResponse });
      } catch (error) {
        console.error(error);
        this.setCurrentDashboardWidgetData({ uuid, data: [] });
      }
    },

    async getWidgetGraphFunnelData({ uuid, widgetFunnelConfig }) {
      const fetchData = async (metric) => {
        const { name } = widgetFunnelConfig[metric];
        const { value }: any = await Dashboards.getDashboardWidgetData({
          dashboardUuid: useDashboards().currentDashboard.uuid,
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
      this.setCurrentDashboardWidgetData({ uuid, data: formattedResponse });
    },

    async getWidgetVtexOrderData({ uuid, utm_source = '' }) {
      try {
        const response: {
          countSell?: string;
          accumulatedTotal?: string;
          medium_ticket?: string;
        } = (await Dashboards.getDashboardWidgetData({
          dashboardUuid: useDashboards().currentDashboard.uuid,
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
        this.setCurrentDashboardWidgetData({ uuid, data: formattedResponse });
      } catch (error) {
        console.error(error);
        this.setCurrentDashboardWidgetData({
          uuid,
          data: {
            uuid,
            data: {
              orders: '',
              total_value: '',
              average_ticket: '',
            },
          },
        });
      }
    },

    updateCurrentWidgetEditingConfig(config) {
      this.updateCurrentWidgetEditing({ ...this.currentWidgetEditing, config });
    },

    async updateWidget(widget: WidgetType) {
      await Widgets.updateWidget({
        widget,
      });
      this.updateCurrentDashboardWidget(widget);
    },

    async updateCurrentExpansiveWidgetData(widget) {
      const setWidgetData = (data) =>
        this.setCurrentExpansiveWidgetData({ ...widget, data });
      this.setLoadingCurrentExpansiveWidget(true);

      setWidgetData(widget);
      try {
        const customParams: { [key: string]: any } = {};

        if (this.currentExpansiveWidgetFilters.sector) {
          customParams.sector = this.currentExpansiveWidgetFilters.sector;
        }

        if (this.currentExpansiveWidgetFilters.queue) {
          customParams.queue = this.currentExpansiveWidgetFilters.queue;
        }

        if (this.currentExpansiveWidgetFilters.date?.start) {
          customParams.start_date =
            this.currentExpansiveWidgetFilters.date.start;
        }

        if (this.currentExpansiveWidgetFilters.date?.end) {
          customParams.end_date = this.currentExpansiveWidgetFilters.date.end;
        }

        const data = await Dashboards.getCustomStatusData({
          params: customParams,
        });
        setWidgetData(data);
      } catch (error) {
        console.error('getCustomStatusData', error);
        setWidgetData(null);
      } finally {
        this.setLoadingCurrentExpansiveWidget(false);
      }
    },

    updateCurrentExpansiveWidgetFilters(filters) {
      this.setCurrentExpansiveWidgetFilters(filters);
    },

    resetCurrentExpansiveWidgetFilters() {
      this.resetCurrentExpansiveWidgetsFilters();
    },

    updateCurrentExpansiveWidgetLoading(loading) {
      this.setLoadingCurrentExpansiveWidget(loading);
    },

    findWidgetBySource(source: string): WidgetType | undefined {
      return this.currentDashboardWidgets.find(
        (widget: WidgetType) => widget.source === source,
      );
    },
  },
});
