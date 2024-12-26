import { describe, vi, beforeEach, it, expect } from 'vitest';
import { createStore } from 'vuex';

import reports from '@/store/modules/reports';
import { Dashboards } from '@/services/api';
import Router from '@/router';

vi.mock('@/services/api', () => ({
  Dashboards: {
    getDashboardWidgetReport: vi.fn(),
    getDashboardWidgetReportData: vi.fn(),
  },
}));

vi.mock('@/router', () => ({
  default: {
    currentRoute: {
      value: {
        params: {
          dashboardUuid: 'dashboard-uuid',
          widgetUuid: 'widget-uuid',
        },
        query: {
          slug: 'report-slug',
        },
      },
    },
  },
}));

describe('Reports Store', () => {
  let store;

  beforeEach(() => {
    store = createStore({
      modules: {
        reports: { ...reports, namespaced: true },
      },
    });
  });

  describe('mutations', () => {
    it('should have an initial state with report and isLoadingReport set to null and false respectively', () => {
      expect(store.state.reports.report).toBeNull();
      expect(store.state.reports.isLoadingReport).toBe(false);
    });

    it('should set report when SET_REPORT mutation is committed', () => {
      const report = { id: 1, name: 'Test Report' };
      store.commit('reports/SET_REPORT', report);
      expect(store.state.reports.report).toEqual(report);
    });

    it('should set isLoadingReport when SET_LOADING_REPORT mutation is committed', () => {
      store.commit('reports/SET_LOADING_REPORT', true);
      expect(store.state.reports.isLoadingReport).toBe(true);
    });

    it('should reset report when RESET_REPORT mutation is committed', () => {
      const report = { id: 1, name: 'Test Report' };
      store.commit('reports/SET_REPORT', report);
      store.commit('reports/RESET_REPORT');
      expect(store.state.reports.report).toBeNull();
    });
  });

  describe('getWidgetReport action', () => {
    it('should pass dashboardUuid and widgetUuid to getDashboardWidgetReport', async () => {
      const { dashboardUuid, widgetUuid } = Router.currentRoute.value.params;
      Dashboards.getDashboardWidgetReport.mockResolvedValue({});
      await store.dispatch('reports/getWidgetReport');
      expect(Dashboards.getDashboardWidgetReport).toHaveBeenCalledWith({
        dashboardUuid,
        widgetUuid,
      });
    });

    it('should not commit SET_REPORT mutation when not have report', async () => {
      Dashboards.getDashboardWidgetReport.mockResolvedValue(null);
      await store.dispatch('reports/getWidgetReport');
      expect(store.state.reports.report).toStrictEqual({});
    });

    it('should commit SET_LOADING_REPORT and SET_REPORT mutations when report is retrieved successfully', async () => {
      const commitSpy = vi.spyOn(store, 'commit');
      const report = { id: 1, name: 'Test Report' };
      Dashboards.getDashboardWidgetReport.mockResolvedValue(report);

      await store.dispatch('reports/getWidgetReport');

      expect(commitSpy).toHaveBeenCalledWith(
        'reports/SET_LOADING_REPORT',
        true,
        undefined,
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'reports/SET_REPORT',
        report,
        undefined,
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'reports/SET_LOADING_REPORT',
        false,
        undefined,
      );
    });
  });

  describe('getWidgetReportData action', () => {
    const widgetReportDataParamsMock = {
      offset: 0,
      limit: 10,
    };

    it('should pass dashboardUuid, widgetUuid and slug to getDashboardWidgetReportData', async () => {
      const { dashboardUuid, widgetUuid } = Router.currentRoute.value.params;
      const { slug } = Router.currentRoute.value.query;
      Dashboards.getDashboardWidgetReportData.mockResolvedValue({});

      await store.dispatch(
        'reports/getWidgetReportData',
        widgetReportDataParamsMock,
      );

      expect(Dashboards.getDashboardWidgetReportData).toHaveBeenCalledWith({
        dashboardUuid,
        widgetUuid,
        slug,
        ...widgetReportDataParamsMock,
      });
    });

    it('should commit SET_LOADING_REPORT_DATA and SET_REPORT_DATA mutations when report data is retrieved successfully', async () => {
      const commitSpy = vi.spyOn(store, 'commit');
      const reportData = { id: 1, data: 'Sample Report Data' };
      Dashboards.getDashboardWidgetReportData.mockResolvedValue(reportData);

      await store.dispatch(
        'reports/getWidgetReportData',
        widgetReportDataParamsMock,
      );

      expect(commitSpy).toHaveBeenCalledWith(
        'reports/SET_LOADING_REPORT_DATA',
        true,
        undefined,
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'reports/SET_REPORT_DATA',
        reportData,
        undefined,
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'reports/SET_LOADING_REPORT_DATA',
        false,
        undefined,
      );
    });

    it('should throw an error when report data is not retrieved successfully and commit SET_REPORT_DATA as null', async () => {
      const commitSpy = vi.spyOn(store, 'commit');
      Dashboards.getDashboardWidgetReportData.mockRejectedValue(new Error());

      await store.dispatch(
        'reports/getWidgetReportData',
        widgetReportDataParamsMock,
      );

      expect(commitSpy).toHaveBeenCalledWith(
        'reports/SET_REPORT_DATA',
        null,
        undefined,
      );
    });
  });
});
