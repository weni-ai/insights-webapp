<template>
  <section class="funnel-chart">
    <IconLoading
      v-if="isLoading"
      class="funnel-chart__loading"
    />
    <BaseChart
      v-else
      type="funnel"
      :data="mergedData"
      :options="chartOptions"
      :plugins="chartPlugins"
    />
  </section>
</template>

<script>
import IconLoading from '@/components/IconLoading.vue';
import BaseChart from './BaseChart.vue';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { deepMerge } from '@/utils/object';

export default {
  name: 'FunnelChart',

  components: { IconLoading, BaseChart },

  props: {
    isLoading: Boolean,
    chartData: {
      type: Object,
      required: true,
    },
  },

  computed: {
    barColors() {
      const colorsList = {
        3: ['#003234', '#086766', '#00A49F'],
        4: ['#003234', '#086766', '#028380', '#00A49F'],
        5: ['#003234', '#0C5554', '#086766', '#028380', '#00A49F'],
      };
      return colorsList[this.chartData.datasets[0].data.length];
    },
    mergedData() {
      return deepMerge({}, this.chartData);
    },
    chartOptions() {
      return {
        indexAxis: 'y',
        backgroundColor: this.barColors,
        barPercentage: 1.02,
        plugins: {
          datalabels: {
            color: '#fff',
            align: 'center',
            font: {
              size: '16',
              weight: '700',
            },
          },
        },
      };
    },
    chartPlugins() {
      return [ChartDataLabels];
    },
  },
};
</script>

<style lang="scss" scoped>
.funnel-chart {
  height: 100%;

  display: flex;

  &__loading {
    margin: auto;
  }
}
</style>
