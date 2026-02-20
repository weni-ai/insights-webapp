<template>
  <section
    ref="servicesOpenByHour"
    class="services-open-by-hour"
    data-testid="services-open-by-hour"
  >
    <BlurSetupWidget
      v-if="showSetup"
      v-bind="widgetSetupProps"
    />
    <LineChart
      data-testid="services-open-by-hour-chart"
      :title="$t('human_support_dashboard.services_open_by_hour.title')"
      :chartData="data"
      :seeMore="false"
      :isLoading="isLoading"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed, useTemplateRef } from 'vue';
import { useMouseInElement } from '@vueuse/core';
import { storeToRefs } from 'pinia';

import LineChart from '@/components/insights/charts/LineChart.vue';
import BlurSetupWidget from '@/components/insights/Layout/BlurSetupWidget.vue';

import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useHumanSupportAnalysis } from '@/store/modules/humanSupport/analysis';
import { useProject } from '@/store/modules/project';

import { analysisPeaksInHumanServiceMock } from './mocks';

const projectStore = useProject();
const { hasChatsSectors } = storeToRefs(projectStore);

const humanSupport = useHumanSupport();
const { widgetSetupProps } = storeToRefs(humanSupport);

const servicesOpenByHourRef =
  useTemplateRef<HTMLDivElement>('servicesOpenByHour');
const { isOutside } = useMouseInElement(servicesOpenByHourRef);

const showSetup = computed(() => {
  return !isOutside.value && !hasChatsSectors.value;
});

const humanSupportAnalysis = useHumanSupportAnalysis();
const { loadHumanSupportByHourData } = humanSupportAnalysis;

const { servicesOpenByHourData, loadingHumanSupportByHourData } =
  storeToRefs(humanSupportAnalysis);

const widgetData = computed(() => {
  if (!hasChatsSectors.value) {
    return analysisPeaksInHumanServiceMock;
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

onMounted(() => {
  loadHumanSupportByHourData();
});
</script>

<style scoped lang="scss">
.services-open-by-hour {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-3;
  max-height: 250px;
}
</style>
