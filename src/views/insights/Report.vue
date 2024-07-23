<template>
  <section class="report">
    <DynamicWidget
      v-if="report"
      :widget="report"
    />
  </section>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';

import DynamicWidget from '@/components/insights/widgets/DynamicWidget.vue';

export default {
  name: 'ReportView',

  components: {
    DynamicWidget,
  },

  computed: {
    ...mapState({
      report: (state) => state.reports.report,
    }),
  },

  created() {
    this.resetReport();
    this.resetCurrentDashboardWidgets();
  },

  mounted() {
    this.getWidgetReport();
  },

  methods: {
    ...mapMutations({
      resetCurrentDashboardWidgets:
        'dashboards/RESET_CURRENT_DASHBOARD_WIDGETS',
      resetReport: 'reports/RESET_REPORT',
    }),
    ...mapActions({
      getWidgetReport: 'reports/getWidgetReport',
    }),
  },
};
</script>

<style lang="scss" scoped>
.report {
  overflow: hidden;

  height: 100%;

  display: grid;
  gap: $unnnic-spacing-sm;

  & > [class*='chart'] {
    border-radius: $unnnic-spacing-nano;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

    :deep([class*='title']) {
      font-size: $unnnic-font-size-body-lg;
    }
  }
}
</style>
