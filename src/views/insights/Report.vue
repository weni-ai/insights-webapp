<template>
  <section class="report">
    <DynamicWidget
      v-if="report"
      :widget="report"
      :isLoading="reportLoadingStatus"
    />
  </section>
</template>

<script>
import { Dashboards } from '@/services/api';

import DynamicWidget from '@/components/insights/widgets/DynamicWidget.vue';
import { mapState } from 'vuex';

export default {
  name: 'ReportView',

  components: {
    DynamicWidget,
  },

  data() {
    return {
      report: null,
    };
  },

  computed: {
    ...mapState({
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),

    reportLoadingStatus() {
      const { report } = this;
      const config = report?.config;
      const isConfigured = config && Object.keys(config).length !== 0;
      return isConfigured ? !Object.keys(report).includes('data') : false;
    },
  },

  created() {
    this.getWidgetReport();
  },

  methods: {
    async getWidgetReport() {
      const report = await Dashboards.getDashboardWidgetReport({
        dashboardUuid: this.currentDashboard.uuid,
        widgetUuid: this.$route.params.widgetUuid,
      });

      if (report) {
        this.report = report;
        this.getWidgetReportData();
      }
    },

    async getWidgetReportData() {
      const { results } = await Dashboards.getDashboardWidgetReportData({
        dashboardUuid: this.currentDashboard.uuid,
        widgetUuid: this.report.widget,
        reportUuid: this.report.uuid,
      });

      if (results) {
        this.report.data = { data: results };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.report {
  overflow: hidden;

  height: 100%;

  display: grid;
  gap: $unnnic-spacing-sm;
}
</style>
