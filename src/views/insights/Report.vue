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

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';

import { useReports } from '@/store/modules/reports';
import { useWidgets } from '@/store/modules/widgets';

import IconLoading from '@/components/IconLoading.vue';
import FlowResultContactListModal from '@/components/FlowResultContactListModal.vue';

defineOptions({ name: 'ReportView' });

const DynamicWidget = defineAsyncComponent(
  /* istanbul ignore next */
  () => import('@/components/insights/widgets/DynamicWidget.vue'),
);

const reportsStore = useReports();
const widgetsStore = useWidgets();
const { report, isLoadingReport } = storeToRefs(reportsStore);

const showFlowResultsContactListModal = ref(false);
const flowResultsContactListParams = ref<Record<string, any> | null>(null);

const openFlowResultContactList = (data: Record<string, any>) => {
  flowResultsContactListParams.value = data;
  showFlowResultsContactListModal.value = true;
};

const closeFlowResultContactList = () => {
  flowResultsContactListParams.value = {};
  showFlowResultsContactListModal.value = false;
};

reportsStore.resetReport();
widgetsStore.resetCurrentDashboardWidgets();

onMounted(() => {
  reportsStore.getWidgetReport();
});

defineExpose({
  showFlowResultsContactListModal,
  flowResultsContactListParams,
  openFlowResultContactList,
  closeFlowResultContactList,
  resetReport: (...args: any[]) => reportsStore.resetReport(...args),
  resetCurrentDashboardWidgets: (...args: any[]) =>
    widgetsStore.resetCurrentDashboardWidgets(...args),
  getWidgetReport: (...args: any[]) => reportsStore.getWidgetReport(...args),
});
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
      font: $unnnic-font-display-4;
    }
  }
}
</style>
