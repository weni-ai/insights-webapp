import { defineStore } from 'pinia';
import Router from '@/router';
import { Dashboards } from '@/services/api';

export const useReports = defineStore('reports', {
  state: () => ({
    report: null,
    isLoadingReport: false,
    isLoadingReportData: false,
  }),
  actions: {
    async getWidgetReport() {
      this.isLoadingReport = true;

      const { dashboardUuid, widgetUuid } = Router.currentRoute.value.params;

      const report = await Dashboards.getDashboardWidgetReport({
        dashboardUuid: dashboardUuid,
        widgetUuid: widgetUuid,
      });

      if (report) {
        this.report = report;
      }

      this.isLoadingReport = false;
    },
    async getWidgetReportData({ offset, limit, next }) {
      this.isLoadingReportData = true;

      const { dashboardUuid, widgetUuid } = Router.currentRoute.value.params;
      const { slug } = Router.currentRoute.value.query;
      try {
        const data = await Dashboards.getDashboardWidgetReportData({
          dashboardUuid: dashboardUuid,
          widgetUuid: widgetUuid,
          slug,
          offset,
          limit,
          next,
        });
        if (this.report) this.report.data = data;
      } catch (error) {
        console.error(error);
        if (this.report) this.report.data = null;
      } finally {
        this.isLoadingReportData = false;
      }
    },
    resetReport() {
      this.report = null;
    },
  },
});
