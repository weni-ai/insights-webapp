import Router from '@/router';
import { Dashboards } from '@/services/api';

const mutations = {
  SET_REPORT: 'SET_REPORT',
  SET_REPORT_DATA: 'SET_REPORT_DATA',
  RESET_REPORT: 'RESET_REPORT',
  SET_LOADING_REPORT: 'SET_LOADING_REPORT',
  SET_LOADING_REPORT_DATA: 'SET_LOADING_REPORT_DATA',
};

export default {
  namespaced: true,
  state: {
    report: null,
    isLoadingReport: false,
    isLoadingReportData: false,
  },
  mutations: {
    [mutations.SET_REPORT](state, report) {
      state.report = report;
    },
    [mutations.SET_REPORT_DATA](state, data) {
      state.report.data = data;
    },
    [mutations.SET_LOADING_REPORT](state, loading) {
      state.isLoadingReport = loading;
    },
    [mutations.SET_LOADING_REPORT_DATA](state, loading) {
      state.isLoadingReportData = loading;
    },
    [mutations.RESET_REPORT](state) {
      state.report = null;
    },
  },
  actions: {
    async getWidgetReport({ commit }) {
      commit(mutations.SET_LOADING_REPORT, true);
      const { dashboardUuid, widgetUuid } = Router.currentRoute.value.params;
      const report = await Dashboards.getDashboardWidgetReport({
        dashboardUuid: dashboardUuid,
        widgetUuid: widgetUuid,
      });

      if (report) {
        commit(mutations.SET_REPORT, report);
      }

      commit(mutations.SET_LOADING_REPORT, false);
    },

    async getWidgetReportData({ commit }, { offset, limit, next }) {
      commit(mutations.SET_LOADING_REPORT_DATA, true);
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
        commit(mutations.SET_REPORT_DATA, data);
      } catch (error) {
        console.error(error);
        commit(mutations.SET_REPORT_DATA, null);
      } finally {
        commit(mutations.SET_LOADING_REPORT_DATA, false);
      }
    },
  },
};
