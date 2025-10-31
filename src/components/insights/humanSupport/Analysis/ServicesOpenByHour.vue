<template>
  <section
    class="services-open-by-hour"
    data-testid="services-open-by-hour"
  >
    <LineChart
      data-testid="services-open-by-hour-chart"
      :title="$t('human_support_dashboard.services_open_by_date.title')"
      :chartData="data"
      :seeMore="false"
      :isLoading="isLoading"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useHumanSupportAnalysis } from '@/store/modules/humanSupport/analysis';
import LineChart from '@/components/insights/charts/LineChart.vue';
import { storeToRefs } from 'pinia';

const humanSupportAnalysis = useHumanSupportAnalysis();
const { loadHumanSupportByHourData } = humanSupportAnalysis;

const { servicesOpenByHourData, loadingHumanSupportByHourData } =
  storeToRefs(humanSupportAnalysis);

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

onMounted(() => {
  loadHumanSupportByHourData();
});
</script>

<style scoped lang="scss">
.services-open-by-hour {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-3;
  max-height: 250px;
}
</style>
