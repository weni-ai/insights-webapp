<template>
  <section class="report">
    <DynamicWidget
      v-if="report"
      :widget="report"
    />
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';

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
    this.getWidgetReport();
  },

  methods: {
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
}
</style>
