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
    vi.clearAllMocks();
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

  it('should get widget recurrence data successfully', async () => {
    const store = useWidgets();
    const widget = { uuid: 'recurrence-1', name: 'Recurrence Widget' };
    const mockData = { results: [{ date: '2024-01-01', value: 10 }] };
    Dashboards.getDashboardWidgetData.mockResolvedValue(mockData);

    store.setCurrentDashboardWidgets([widget]);
    await store.getWidgetRecurrenceData({ uuid: widget.uuid });

    const updatedWidget = store.currentDashboardWidgets.find(
      (w) => w.uuid === widget.uuid,
    );
    expect(updatedWidget?.data).toEqual(mockData.results);
  });

  it('should handle error in widget recurrence data', async () => {
    const store = useWidgets();
    const widget = { uuid: 'recurrence-2', name: 'Recurrence Widget' };
    Dashboards.getDashboardWidgetData.mockRejectedValue(new Error('API Error'));

    store.setCurrentDashboardWidgets([widget]);
    await store.getWidgetRecurrenceData({ uuid: widget.uuid });

    const updatedWidget = store.currentDashboardWidgets.find(
      (w) => w.uuid === widget.uuid,
    );
    expect(updatedWidget?.data).toEqual([]);
  });

  it('should get widget graph funnel data successfully', async () => {
    const store = useWidgets();
    const widget = { uuid: 'funnel-1', name: 'Funnel Widget' };
    const widgetFunnelConfig = {
      step1: { name: 'Step 1' },
      step2: { name: 'Step 2' },
    };
    const mockResponses = [{ value: 100 }, { value: 50 }];

    Dashboards.getDashboardWidgetData
      .mockResolvedValueOnce({ value: mockResponses[0].value })
      .mockResolvedValueOnce({ value: mockResponses[1].value });

    store.setCurrentDashboardWidgets([widget]);
    await store.getWidgetGraphFunnelData({
      uuid: widget.uuid,
      widgetFunnelConfig,
    });

    const updatedWidget = store.currentDashboardWidgets.find(
      (w) => w.uuid === widget.uuid,
    );
    expect(updatedWidget?.data).toHaveLength(2);
    expect(updatedWidget?.data[0].percentage).toBe(66.67);
    expect(updatedWidget?.data[1].percentage).toBe(33.33);
  });

  it('should get VTEX order data successfully', async () => {
    const store = useWidgets();
    const widget = { uuid: 'vtex-1', name: 'VTEX Widget' };
    const mockData = {
      countSell: '10',
      accumulatedTotal: '1000',
      medium_ticket: '100',
    };
    Dashboards.getDashboardWidgetData.mockResolvedValue(mockData);

    store.setCurrentDashboardWidgets([widget]);
    await store.getWidgetVtexOrderData({ uuid: widget.uuid });

    const updatedWidget = store.currentDashboardWidgets.find(
      (w) => w.uuid === widget.uuid,
    );
    expect(updatedWidget?.data).toEqual({
      orders: '10',
      total_value: '1000',
      average_ticket: '100',
    });
  });

  it('should handle empty VTEX order data', async () => {
    const store = useWidgets();
    const widget = { uuid: 'vtex-2', name: 'VTEX Widget' };
    const mockData = {};
    Dashboards.getDashboardWidgetData.mockResolvedValue(mockData);

    store.setCurrentDashboardWidgets([widget]);
    await store.getWidgetVtexOrderData({ uuid: widget.uuid });

    const updatedWidget = store.currentDashboardWidgets.find(
      (w) => w.uuid === widget.uuid,
    );
    expect(updatedWidget?.data).toEqual({
      orders: '',
      total_value: '',
      average_ticket: '',
    });
  });

  it('should handle error in VTEX order data', async () => {
    const store = useWidgets();
    const widget = { uuid: 'vtex-3', name: 'VTEX Widget' };
    Dashboards.getDashboardWidgetData.mockRejectedValue(new Error('API Error'));

    store.setCurrentDashboardWidgets([widget]);
    await store.getWidgetVtexOrderData({ uuid: widget.uuid });

    const updatedWidget = store.currentDashboardWidgets.find(
      (w) => w.uuid === widget.uuid,
    );
    expect(updatedWidget?.data).toEqual({
      uuid: widget.uuid,
      data: {
        orders: '',
        total_value: '',
        average_ticket: '',
      },
    });
  });

  it('should update current expansive widget data successfully', async () => {
    const store = useWidgets();
    const widget = { uuid: 'expansive-1', name: 'Expansive Widget' };
    const mockData = { result: 'success' };
    Dashboards.getCustomStatusData.mockResolvedValue(mockData);

    store.setCurrentExpansiveWidgetFilters({ sector: 'test', queue: 'test' });
    await store.updateCurrentExpansiveWidgetData(widget);

    expect(store.currentExpansiveWidget).toEqual({ ...widget, data: mockData });
    expect(store.isLoadingCurrentExpansiveWidget).toBe(false);
  });

  it('should handle error in current expansive widget data', async () => {
    const store = useWidgets();
    const widget = { uuid: 'expansive-2', name: 'Expansive Widget' };
    Dashboards.getCustomStatusData.mockRejectedValue(new Error('API Error'));

    store.setCurrentExpansiveWidgetFilters({ sector: 'test', queue: 'test' });
    await store.updateCurrentExpansiveWidgetData(widget);

    expect(store.currentExpansiveWidget).toEqual({ ...widget, data: null });
    expect(store.isLoadingCurrentExpansiveWidget).toBe(false);
  });

  it('should update current expansive widget filters', () => {
    const store = useWidgets();
    const filters = {
      sector: 'new-sector',
      queue: 'new-queue',
      date: { start: '', end: '' },
    };

    store.updateCurrentExpansiveWidgetFilters(filters);

    expect(store.currentExpansiveWidgetFilters).toEqual(filters);
  });

  it('should reset current expansive widget filters', () => {
    const store = useWidgets();
    store.setCurrentExpansiveWidgetFilters({ sector: 'test', queue: 'test' });

    store.resetCurrentExpansiveWidgetFilters();

    expect(store.currentExpansiveWidgetFilters).toEqual({
      sector: '',
      queue: '',
    });
  });

  it('should update current expansive widget loading state', () => {
    const store = useWidgets();

    store.updateCurrentExpansiveWidgetLoading(true);
    expect(store.isLoadingCurrentExpansiveWidget).toBe(true);

    store.updateCurrentExpansiveWidgetLoading(false);
    expect(store.isLoadingCurrentExpansiveWidget).toBe(false);
  });

  it('should reset current dashboard widgets', () => {
    const store = useWidgets();
    const widgets = [
      { uuid: 'widget-1', name: 'Widget 1' },
      { uuid: 'widget-2', name: 'Widget 2' },
    ];

    store.setCurrentDashboardWidgets(widgets);
    expect(store.currentDashboardWidgets).toEqual(widgets);

    store.resetCurrentDashboardWidgets();
    expect(store.currentDashboardWidgets).toEqual([]);
  });

  it('should update current widget editing config', async () => {
    const store = useWidgets();
    const initialWidget = {
      uuid: 'widget-1',
      name: 'Test Widget',
      config: { oldValue: 'test' },
    };
    const newConfig = { newValue: 'updated' };

    await store.updateCurrentWidgetEditing(initialWidget);
    expect(store.currentWidgetEditing).toEqual(initialWidget);

    store.updateCurrentWidgetEditingConfig(newConfig);
    expect(store.currentWidgetEditing).toEqual({
      ...initialWidget,
      config: newConfig,
    });
  });

  it('should get current dashboard widgets data', async () => {
    const store = useWidgets();
    const widgets = [
      { uuid: 'widget-1', name: 'Widget 1', config: { key: 'value1' } },
      { uuid: 'widget-2', name: 'Widget 2', config: { key: 'value2' } },
      { uuid: 'widget-3', name: '', config: {} },
      { uuid: 'widget-4', name: 'Widget 4', config: {} },
    ];

    const mockData1 = { result: 'data1' };
    const mockData2 = { result: 'data2' };

    Dashboards.getDashboardWidgetData
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    store.setCurrentDashboardWidgets(widgets);
    await store.getCurrentDashboardWidgetsDatas();

    expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledTimes(2);
    expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledWith({
      dashboardUuid: '123',
      widgetUuid: 'widget-1',
    });
    expect(Dashboards.getDashboardWidgetData).toHaveBeenCalledWith({
      dashboardUuid: '123',
      widgetUuid: 'widget-2',
    });

    const updatedWidgets = store.currentDashboardWidgets;
    expect(updatedWidgets[0].data).toEqual(mockData1);
    expect(updatedWidgets[1].data).toEqual(mockData2);
    expect(updatedWidgets[2].data).toBeUndefined();
    expect(updatedWidgets[3].data).toBeUndefined();
  });
});
