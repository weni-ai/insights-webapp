import { setActivePinia, createPinia } from 'pinia';
import { useWidgets } from '../widgets';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Dashboards, Widgets } from '@/services/api';

vi.mock('@/services/api', () => ({
  Dashboards: {
    getDashboardWidgets: vi.fn(),
    getDashboardWidgetData: vi.fn(),
    getCustomStatusData: vi.fn(),
  },
  Widgets: {
    updateWidget: vi.fn(),
  },
}));

vi.mock('../dashboards', () => ({
  useDashboards: vi.fn(() => ({
    currentDashboard: { uuid: '123' },
  })),
}));

describe('useWidgets store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should fetch widgets from the current dashboard', async () => {
    const store = useWidgets();
    const mockWidgets = [{ uuid: 'abc', name: 'Widget 1', config: {} }];
    Dashboards.getDashboardWidgets.mockResolvedValue(mockWidgets);

    await store.getCurrentDashboardWidgets();

    expect(store.currentDashboardWidgets).toEqual(mockWidgets);
    expect(store.isLoadingCurrentDashboardWidgets).toBe(false);
  });

  it('should fetch widget data successfully', async () => {
    const store = useWidgets();
    const widget = { uuid: 'abc', name: 'Widget Test', config: {} };
    const mockData = { result: 42 };
    Dashboards.getDashboardWidgetData.mockResolvedValue(mockData);

    store.setCurrentDashboardWidgets([widget]);
    await store.getCurrentDashboardWidgetData(widget);

    const updatedWidget = store.currentDashboardWidgets.find(
      (w) => w.uuid === widget.uuid,
    );
    expect(updatedWidget?.data).toEqual(mockData);
  });

  it('should handle VTEX widget error correctly', async () => {
    const store = useWidgets();
    const widget = {
      uuid: 'vtex-1',
      name: 'Broken Widget',
      type: 'vtex_conversions',
      config: {},
    };
    Dashboards.getDashboardWidgetData.mockRejectedValue(new Error('API Error'));

    store.setCurrentDashboardWidgets([widget]);
    await store.getCurrentDashboardWidgetData(widget);

    const updatedWidget = store.currentDashboardWidgets.find(
      (w) => w.uuid === widget.uuid,
    );
    expect(updatedWidget?.data).toEqual({ error: true });
  });

  it('should update a widget', async () => {
    const store = useWidgets();
    const widget = { uuid: 'update-1', name: 'Widget to Update', config: {} };
    Widgets.updateWidget.mockResolvedValue(undefined);

    store.setCurrentDashboardWidgets([widget]);
    await store.updateWidget(widget);

    expect(Widgets.updateWidget).toHaveBeenCalledWith({ widget });
    expect(store.currentDashboardWidgets[0]).toEqual(widget);
  });
});
