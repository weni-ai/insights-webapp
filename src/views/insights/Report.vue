<template>
  <section :class="{ report: true, 'report--loading': isLoadingReport }">
    <IconLoading v-if="isLoadingReport" />
    <DynamicWidget
      v-else-if="report"
      :widget="report"
      @click-data="openFlowResultContactList"
    />

    <FlowResultContactListModal
      v-if="showFlowResultsContactListModal"
      :flowResultLabel="flowResultsContactListParams?.label"
      :flow="flowResultsContactListParams?.flow"
      @close="closeFlowResultContactList()"
    />
  </section>
</template>

<script>
import { mapActions, mapState } from 'pinia';

import { useReports } from '@/store/modules/reports';
import { useWidgets } from '@/store/modules/widgets';

import IconLoading from '@/components/IconLoading.vue';
import FlowResultContactListModal from '@/components/FlowResultContactListModal.vue';
import { defineAsyncComponent } from 'vue';

export default {
  name: 'ReportView',

  components: {
    DynamicWidget: defineAsyncComponent(
      /* istanbul ignore next */
      () => import('@/components/insights/widgets/DynamicWidget.vue'),
    ),
    IconLoading,
    FlowResultContactListModal,
  },

  data() {
    return {
      showFlowResultsContactListModal: false,
      flowResultsContactListParams: null,
    };
  },

  computed: {
    ...mapState(useReports, ['report', 'isLoadingReport']),
  },

  created() {
    this.resetReport();
    this.resetCurrentDashboardWidgets();
  },

  mounted() {
    this.getWidgetReport();
  },

  methods: {
    ...mapActions(useWidgets, ['resetCurrentDashboardWidgets']),
    ...mapActions(useReports, ['resetReport', 'getWidgetReport']),
    openFlowResultContactList(data) {
      this.flowResultsContactListParams = data;
      this.showFlowResultsContactListModal = true;
    },

    closeFlowResultContactList() {
      this.flowResultsContactListParams = {};
      this.showFlowResultsContactListModal = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.report {
  overflow: hidden;

  height: 100%;

  display: grid;

  gap: $unnnic-space-4;

  &--loading {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  & > [class*='chart'] {
    border-radius: $unnnic-space-1;
    border: 1px solid $unnnic-color-gray-2;

    :deep([class*='title']) {
      font-size: $unnnic-font-size;
    }
  }
}
</style>
