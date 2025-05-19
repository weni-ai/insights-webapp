import { setActivePinia, createPinia } from 'pinia';
import { useReports } from '../reports';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Dashboards } from '@/services/api';

vi.mock('@/router', () => ({
  default: {
    currentRoute: {
      value: {
        params: { dashboardUuid: 'dash-1', widgetUuid: 'widg-1' },
        query: { slug: 'some-slug' },
      },
    },
  },
}));

vi.mock('@/services/api', () => ({
  Dashboards: {
    getDashboardWidgetReport: vi.fn(),
    getDashboardWidgetReportData: vi.fn(),
  },
}));

describe('useReports store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should set report from getWidgetReport', async () => {
    const store = useReports();
    const mockReport = { title: 'Report' };
    vi.mocked(Dashboards.getDashboardWidgetReport).mockResolvedValue(
      mockReport,
    );

    await store.getWidgetReport();

    expect(store.report).toEqual(mockReport);
    expect(store.isLoadingReport).toBe(false);
  });

  it('should set report data from getWidgetReportData', async () => {
    const store = useReports();
    store.report = { data: null };
    const mockData = [{ item: 'data' }];
    vi.mocked(Dashboards.getDashboardWidgetReportData).mockResolvedValue(
      mockData,
    );

    await store.getWidgetReportData({ offset: 0, limit: 10, next: null });

    expect(store.report.data).toEqual(mockData);
    expect(store.isLoadingReportData).toBe(false);
  });

  it('should handle error in getWidgetReportData', async () => {
    const store = useReports();
    store.report = { data: 'initial' };
    vi.mocked(Dashboards.getDashboardWidgetReportData).mockRejectedValue(
      new Error('error'),
    );

    await store.getWidgetReportData({ offset: 0, limit: 10, next: null });

    expect(store.report.data).toBeNull();
    expect(store.isLoadingReportData).toBe(false);
  });

  it('should reset report', () => {
    const store = useReports();
    store.report = { something: true };
    store.resetReport();

    expect(store.report).toBeNull();
  });
});
