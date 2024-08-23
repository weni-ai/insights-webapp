<template>
  <section :class="{ report: true, 'report--loading': isLoadingReport }">
    <IconLoading v-if="isLoadingReport" />
    <DynamicWidget
      v-else-if="report"
      :widget="report"
    />
  </section>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';

import DynamicWidget from '@/components/insights/widgets/DynamicWidget.vue';
import IconLoading from '@/components/IconLoading.vue';

export default {
  name: 'ReportView',

  components: {
    DynamicWidget,
    IconLoading,
  },

  computed: {
    ...mapState({
      report: (state) => state.reports.report,
      isLoadingReport: (state) => state.reports.isLoadingReport,
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
        'widgets/RESET_CURRENT_DASHBOARD_WIDGETS',
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

  &--loading {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  & > [class*='chart'] {
    border-radius: $unnnic-spacing-nano;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

    :deep([class*='title']) {
      font-size: $unnnic-font-size-body-lg;
    }
  }
}
</style>
