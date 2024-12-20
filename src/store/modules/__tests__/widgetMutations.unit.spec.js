import { describe, beforeEach, it, expect } from 'vitest';
import { createStore } from 'vuex';

import widgets from '@/store/modules/widgets';

const store = createStore({
  modules: {
    widgets: {
      namespaced: true,
      ...widgets,
    },
  },
});

describe('Widgets Store', () => {
  beforeEach(() => {
    const widgets = [
      { uuid: '1', name: 'Widget 1' },
      { uuid: '2', name: 'Widget 2' },
    ];
    store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGETS', widgets);
  });

  describe('mutations', () => {
    describe('SET_LOADING_CURRENT_DASHBOARD_WIDGETS', () => {
      it('should set loading current dashboard widgets', () => {
        store.commit('widgets/SET_LOADING_CURRENT_DASHBOARD_WIDGETS', true);
        expect(store.state.widgets.isLoadingCurrentDashboardWidgets).toBe(true);
      });
    });

    describe('SET_CURRENT_DASHBOARD_WIDGETS', () => {
      it('should set current dashboard widgets', () => {
        const widgets = [
          { uuid: '1', name: 'Widget 1' },
          { uuid: '2', name: 'Widget 2' },
          { uuid: '3', name: 'Widget 3' },
        ];
        store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGETS', widgets);
        expect(store.state.widgets.currentDashboardWidgets).toEqual(widgets);
      });
    });

    describe('RESET_CURRENT_DASHBOARD_WIDGETS', () => {
      it('should reset current dashboard widgets', () => {
        store.commit('widgets/RESET_CURRENT_DASHBOARD_WIDGETS');
        expect(store.state.widgets.currentDashboardWidgets).toEqual([]);
      });
    });

    describe('SET_CURRENT_DASHBOARD_WIDGET_DATA', () => {
      it('should set current dashboard widget data', () => {
        const data = { foo: 'bar' };
        store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGET_DATA', {
          uuid: store.state.widgets.currentDashboardWidgets[0].uuid,
          data,
        });

        expect(store.state.widgets.currentDashboardWidgets[0].data).toEqual(
          data,
        );
      });

      it('should do nothing when widget is not found', () => {
        const data = { foo: 'bar' };
        store.commit('widgets/SET_CURRENT_DASHBOARD_WIDGET_DATA', {
          uuid: '123',
          data,
        });

        expect(
          store.state.widgets.currentDashboardWidgets[0].data,
        ).toBeUndefined();
      });
    });

    describe('UPDATE_CURRENT_DASHBOARD_WIDGET', () => {
      it('should update current dashboard widget', () => {
        const widget = { uuid: '1', name: 'Widget updated' };
        store.commit('widgets/UPDATE_CURRENT_DASHBOARD_WIDGET', widget);
        expect(store.state.widgets.currentDashboardWidgets[0]).toEqual(widget);
      });
    });

    describe('UPDATE_CURRENT_WIDGET_EDITING', () => {
      it('should update current widget editing', () => {
        const widget = { uuid: '1', name: 'Widget 12345' };
        store.commit('widgets/UPDATE_CURRENT_WIDGET_EDITING', widget);
        expect(store.state.widgets.currentWidgetEditing).toEqual(widget);
      });

      it('should do nothing when widget is equal to current widget', () => {
        const widget = { uuid: '1', name: 'Widget 1' };

        store.commit('widgets/UPDATE_CURRENT_WIDGET_EDITING', widget);
        expect(store.state.widgets.currentWidgetEditing).toEqual(widget);

        store.commit('widgets/UPDATE_CURRENT_WIDGET_EDITING', widget);
        expect(store.state.widgets.currentWidgetEditing).toEqual(widget);
      });
    });
  });
});
