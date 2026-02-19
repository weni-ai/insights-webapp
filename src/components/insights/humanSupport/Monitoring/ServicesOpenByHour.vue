<template>
  <section
    class="services-open-by-hour"
    data-testid="services-open-by-hour"
  >
    <SetupWidget
      v-if="isHovered"
      v-bind="setupProps"
      @click:action="handleSetupAction"
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
import SetupWidget from '@/components/insights/Layout/SetupWidget.vue';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

const humanSupportMonitoring = useHumanSupportMonitoring();
const { loadHumanSupportByHourData } = humanSupportMonitoring;

const { servicesOpenByHourData, loadingHumanSupportByHourData } = storeToRefs(
  humanSupportMonitoring,
);

const data = computed(() => {
  const formattedData = {
    labels: servicesOpenByHourData.value?.map((item) => item?.label),
    datasets: [
      {
        data: servicesOpenByHourData.value?.map((item) => item?.value),
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
const isHovered = computed(() => !isOutside.value);

// TODO: check if setup?

// TODO: add props
const setupProps = computed(() => ({
  title: 'title test',
  description: 'desc test',
  actionButtonProps: {
    text: 'action text test',
  },
}));

const handleSetupAction = () => {
  console.log('handleSetupAction');
};

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
