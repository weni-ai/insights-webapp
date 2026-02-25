<template>
  <section
    class="services-open-by-hour"
    data-testid="services-open-by-hour"
  >
    <BlurSetupWidget
      v-if="showSetup"
      v-bind="widgetSetupProps"
    />

    <section
      ref="chartContainer"
      class="services-open-by-hour__chart"
    >
      <LineChart
        data-testid="services-open-by-hour-chart"
        :title="$t('human_support_dashboard.services_open_by_hour.title')"
        :chartData="data"
        :seeMore="false"
        :isLoading="isLoading"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useMouseInElement } from '@vueuse/core';

import LineChart from '@/components/insights/charts/LineChart.vue';
import BlurSetupWidget from '@/components/insights/Layout/BlurSetupWidget.vue';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useProject } from '@/store/modules/project';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

import { monitoringPeaksInHumanServiceMock } from './mocks';

const project = useProject();
const { hasChatsSectors } = storeToRefs(project);

const humanSupport = useHumanSupport();
const { widgetSetupProps } = storeToRefs(humanSupport);

const humanSupportMonitoring = useHumanSupportMonitoring();
const { loadHumanSupportByHourData } = humanSupportMonitoring;

const { servicesOpenByHourData, loadingHumanSupportByHourData } = storeToRefs(
  humanSupportMonitoring,
);

const widgetData = computed(() => {
  if (!hasChatsSectors.value) {
    return monitoringPeaksInHumanServiceMock;
  }
  return servicesOpenByHourData.value;
});

const data = computed(() => {
  const formattedData = {
    labels: widgetData.value?.map((item) => item?.label),
    datasets: [
      {
        data: widgetData.value?.map((item) => item?.value),
      },
    ],
  };

  return formattedData;
});

const isLoading = computed(() => {
  return loadingHumanSupportByHourData.value;
});

const chartContainerRef = useTemplateRef<HTMLDivElement>('chartContainer');
const { isOutside } = useMouseInElement(chartContainerRef);
const showSetup = computed(() => {
  return !isOutside.value && !hasChatsSectors.value;
});

onMounted(() => {
  loadHumanSupportByHourData();
});
</script>

<style scoped lang="scss">
.services-open-by-hour {
  position: relative;
  max-height: 250px;
}
</style>
