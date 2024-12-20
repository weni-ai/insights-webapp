import { describe, vi, beforeEach, it, expect, afterEach } from 'vitest';
import { createStore } from 'vuex';

import widgets from '@/store/modules/widgets';
import { Dashboards, Widgets } from '@/services/api';

import dashboards from '../dashboards';

vi.mock('@/services/api', () => ({
  Dashboards: {
    getDashboardWidgets: vi.fn(),
    getDashboardWidgetData: vi.fn(),
  },
  Widgets: {
    updateWidget: vi.fn(),
  },
}));

vi.mock('@/router', () => ({
  default: {
    currentRoute: {
      value: {
        params: {
          dashboardUuid: 'dashboard-uuid',
        },
      },
    },
  },
}));

const store = createStore({
  modules: {
    dashboards: {
      namespaced: true,
      ...dashboards,
    },
    widgets: {
      namespaced: true,
      ...widgets,
    },
  },
});

describe('Widgets Store actions', () => {
  describe('actions', () => {
    afterEach(() => {
      vi.clearAllMocks();
      vi.restoreAllMocks();
    });

    describe('getCurrentDashboardWidgets', () => {
      it('should commit SET_LOADING_CURRENT_DASHBOARD_WIDGETS and SET_CURRENT_DASHBOARD_WIDGETS when widgets are fetched', async () => {
        const commitSpy = vi.spyOn(store, 'commit');

        const widgets = [
          { uuid: '1', name: 'Widget 1' },
          { uuid: '2', name: 'Widget 2' },
        ];
        Dashboards.getDashboardWidgets.mockResolvedValue(widgets);

        await store.dispatch('widgets/getCurrentDashboardWidgets');

        expect(commitSpy).toHaveBeenCalledWith(
          'widgets/SET_LOADING_CURRENT_DASHBOARD_WIDGETS',
          true,
          undefined,
        );
        expect(commitSpy).toHaveBeenCalledWith(
          'widgets/SET_CURRENT_DASHBOARD_WIDGETS',
          widgets,
          undefined,
        );
        expect(commitSpy).toHaveBeenCalledWith(
          'widgets/SET_LOADING_CURRENT_DASHBOARD_WIDGETS',
          false,
          undefined,
        );
      });

      it('should pass currentDashboardUuid to getDashboardWidgets', async () => {
        store.dispatch('dashboards/setCurrentDashboard', {
          uuid: 'dashboard-uuid',
        });

        Dashboards.getDashboardWidgets.mockResolvedValue([]);

        await store.dispatch('widgets/getCurrentDashboardWidgets');

        expect(Dashboards.getDashboardWidgets).toHaveBeenCalledWith(
          store.state.dashboards.currentDashboard.uuid,
        );
      });
    });

    describe('getCurrentDashboardWidgetData', () => {
      const widget = { uuid: '1', name: 'Widget 1' };
      const data = { foo: 'bar' };

      beforeEach(() => {
        store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGETS', [widget]);
      });

      it('should set data to null when widget name is not found and not call getDashboardWidgetData', async () => {
        await store.dispatch('widgets/getCurrentDashboardWidgetData', {
          uuid: '1',
        });

        expect(store.state.widgets.currentDashboardWidgets[0].data).toBeNull();
        expect(Dashboards.getDashboardWidgetData).not.toHaveBeenCalled();
      });

      it('should call getDashboardWidgetData when widget name is found', async () => {
        await store.dispatch('widgets/getCurrentDashboardWidgetData', widget);

        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalled();
        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledWith({
          dashboardUuid: store.state.dashboards.currentDashboard.uuid,
          widgetUuid: widget.uuid,
        });
      });

      it('should set data in widget when request is successful', async () => {
        Dashboards.getDashboardWidgetData.mockResolvedValue(data);

        await store.dispatch('widgets/getCurrentDashboardWidgetData', widget);

        expect(store.state.widgets.currentDashboardWidgets[0].data).toEqual(
          data,
        );
      });

      it('should throw error when request fails', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        const error = new Error('Request failed');
        Dashboards.getDashboardWidgetData.mockRejectedValue(error);

        await store.dispatch('widgets/getCurrentDashboardWidgetData', widget);

        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
        expect(store.state.widgets.currentDashboardWidgets[0].data).toBeNull();
      });
    });

    describe('getCurrentDashboardWidgetsDatas', () => {
      it('should call getCurrentDashboardWidgetData for each widget', async () => {
        const widgets = [
          { uuid: '1', name: 'Widget 1', config: { foo: 'bar' } },
          { uuid: '2', name: 'Widget 2', config: { foo: 'bar' } },
        ];
        store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGETS', widgets);

        await store.dispatch('widgets/getCurrentDashboardWidgetsDatas');

        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledTimes(2);
        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledWith({
          dashboardUuid: store.state.dashboards.currentDashboard.uuid,
          widgetUuid: widgets[0].uuid,
        });
        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledWith({
          dashboardUuid: store.state.dashboards.currentDashboard.uuid,
          widgetUuid: widgets[1].uuid,
        });
      });

      it('should not call getCurrentDashboardWidgetData if widget name is not found', async () => {
        const widgets = [{ uuid: '1', name: '', config: {} }];
        store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGETS', widgets);

        await store.dispatch('widgets/getCurrentDashboardWidgetsDatas');

        expect(Dashboards.getDashboardWidgetData).not.toHaveBeenCalled();
      });
    });

    describe('getWidgetGraphFunnelData', () => {
      it('should call getDashboardWidgetData for each metric', async () => {
        const uuid = 'widget-uuid';
        const metrics = ['metric-1', 'metric-2'];
        store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGETS', [
          { uuid, name: 'Widget 1', config: { metrics } },
        ]);
        Dashboards.getDashboardWidgetData.mockResolvedValue({ value: 'value' });

        await store.dispatch('widgets/getWidgetGraphFunnelData', {
          uuid,
          widgetFunnelConfig: {
            'metric-1': { name: 'Metric 1' },
            'metric-2': { name: 'Metric 2' },
          },
        });

        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledTimes(2);
        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledWith({
          dashboardUuid: store.state.dashboards.currentDashboard.uuid,
          widgetUuid: uuid,
          params: { slug: 'metric-1' },
        });
        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledWith({
          dashboardUuid: store.state.dashboards.currentDashboard.uuid,
          widgetUuid: uuid,
          params: { slug: 'metric-2' },
        });
      });

      it('should format data with percentage from upper to lower', async () => {
        const uuid = 'widget-uuid';
        const metrics = ['metric-1', 'metric-2'];
        store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGETS', [
          { uuid, name: 'Widget 1', config: { metrics } },
        ]);
        Dashboards.getDashboardWidgetData.mockResolvedValue({ value: 100 });

        await store.dispatch('widgets/getWidgetGraphFunnelData', {
          uuid,
          widgetFunnelConfig: {
            'metric-1': { name: 'Metric 1' },
            'metric-2': { name: 'Metric 2' },
          },
        });

        expect(store.state.widgets.currentDashboardWidgets[0].data).toEqual([
          { description: 'Metric 1', percentage: 50, total: 100 },
          { description: 'Metric 2', percentage: 50, total: 100 },
        ]);
      });
    });

    describe('getWidgetVtexOrderData', () => {
      const uuid = 'widget-uuid';

      beforeEach(() => {
        store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGETS', [
          { uuid, name: 'Widget 1' },
        ]);
      });

      it('should call getDashboardWidgetData', async () => {
        Dashboards.getDashboardWidgetData.mockResolvedValue({ value: 'value' });

        await store.dispatch('widgets/getWidgetVtexOrderData', {
          uuid,
          utm_source: 'utm_source',
        });

        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledTimes(1);
        expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledWith({
          dashboardUuid: store.state.dashboards.currentDashboard.uuid,
          widgetUuid: uuid,
          params: {
            utm_source: 'utm_source',
          },
        });
      });

      it('should format data', async () => {
        Dashboards.getDashboardWidgetData.mockResolvedValue({
          countSell: 'countSell',
          accumulatedTotal: 'accumulatedTotal',
          medium_ticket: 'medium_ticket',
        });

        await store.dispatch('widgets/getWidgetVtexOrderData', {
          uuid,
          utm_source: 'utm_source',
        });

        expect(store.state.widgets.currentDashboardWidgets[0].data).toEqual({
          orders: 'countSell',
          total_value: 'accumulatedTotal',
          average_ticket: 'medium_ticket',
        });
      });

      it('should calls SET_CURRENT_DASHBOARD_WIDGET_DATA with formatted data', async () => {
        Dashboards.getDashboardWidgetData.mockResolvedValue({
          countSell: 'countSell',
          accumulatedTotal: 'accumulatedTotal',
          medium_ticket: 'medium_ticket',
        });

        await store.dispatch('widgets/getWidgetVtexOrderData', {
          uuid,
          utm_source: 'utm_source',
        });

        expect(store.state.widgets.currentDashboardWidgets[0].data).toEqual({
          orders: 'countSell',
          total_value: 'accumulatedTotal',
          average_ticket: 'medium_ticket',
        });
      });

      it('should throw error when getDashboardWidgetData fails', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        const error = new Error('Request failed');
        Dashboards.getDashboardWidgetData.mockRejectedValue(error);

        await store.dispatch('widgets/getWidgetVtexOrderData', {
          uuid,
          utm_source: 'utm_source',
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
        expect(store.state.widgets.currentDashboardWidgets[0].data).toEqual({
          orders: '',
          total_value: '',
          average_ticket: '',
        });
      });
    });

    describe('updateCurrentWidgetEditing', () => {
      it('should update current widget editing', async () => {
        const widget = { uuid: '1', name: 'Widget 12345' };

        await store.dispatch('widgets/updateCurrentWidgetEditing', widget);
        expect(store.state.widgets.currentWidgetEditing).toEqual(widget);
      });
    });

    describe('updateCurrentWidgetEditingConfig', () => {
      it('should update current widget editing config', async () => {
        const config = { foo: 'bar' };

        await store.dispatch(
          'widgets/updateCurrentWidgetEditingConfig',
          config,
        );
        expect(store.state.widgets.currentWidgetEditing.config).toEqual(config);
      });
    });

    describe('updateWidget', () => {
      const widget = { uuid: '1', name: 'Widget 12345' };

      it('should call updateWidget request', async () => {
        await store.dispatch('widgets/updateWidget', widget);
        expect(Widgets.updateWidget).toHaveBeenCalledTimes(1);
        expect(Widgets.updateWidget).toHaveBeenCalledWith({ widget });
      });

      it('should call commit UPDATE_CURRENT_DASHBOARD_WIDGET', async () => {
        const commitSpy = vi.spyOn(store, 'commit');

        await store.dispatch('widgets/updateWidget', widget);
        expect(commitSpy).toHaveBeenCalledTimes(1);
        expect(commitSpy).toHaveBeenCalledWith(
          'widgets/UPDATE_CURRENT_DASHBOARD_WIDGET',
          widget,
          undefined,
        );
      });
    });
  });
});
