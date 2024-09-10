<template>
  <section class="bar-chart">
    <header class="bar-chart__header">
      <h1
        class="header__title"
        data-testid="chart-title"
      >
        {{ title }}
      </h1>
      <a
        v-if="seeMore"
        class="header__see-more"
        href="#"
        data-testid="chart-see-more-link"
        @click.prevent.stop="$emit('seeMore')"
      >
        {{ $t('view_more') }}
      </a>
    </header>
    <section
      ref="barChart"
      class="bar-chart__chart"
    >
      <SkeletonBarChart
        v-if="isLoading"
        class="chart__loading"
        data-testid="chart-loading"
        :width="chartWidth"
        :height="chartHeight"
      />
      <BaseChart
        v-else
        type="bar"
        data-testid="chart-bar"
        :data="mergedData"
        :options="chartOptions"
        :plugins="chartPlugins"
      />
    </section>
  </section>
</template>

<script>
import BaseChart from './BaseChart.vue';
import SkeletonBarChart from './loadings/SkeletonBarChart.vue';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { useElementSize } from '@vueuse/core';
import { ref } from 'vue';

import { deepMerge } from '@/utils/object';

export default {
  name: 'BarChart',

  components: { BaseChart, SkeletonBarChart },

  props: {
    title: {
      type: String,
      default: '',
    },
    seeMore: Boolean,
    chartData: {
      type: Object,
      required: true,
    },
    isLoading: Boolean,
  },
  emits: ['seeMore'],

  setup() {
    const barChart = ref(null);
    const { width, height } = useElementSize(barChart);

    return {
      barChart,
      chartWidth: width,
      chartHeight: height,
    };
  },

  computed: {
    mergedData() {
      return deepMerge(
        {
          datasets: [{ borderSkipped: false, minBarLength: 35 }],
        },
        this.chartData,
      );
    },
    chartOptions() {
      return {
        backgroundColor: '#00A49F',
        hoverBackgroundColor: '#00DED2',
        plugins: {
          tooltip: false,
          datalabels: {
            color: function (context) {
              return context.active ? '#003234' : '#fff';
            },
            anchor: 'end',
            align: 'start',
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
.bar-chart {
  box-shadow: $unnnic-shadow-level-far;

  padding: $unnnic-spacing-ant;

  height: 100%;
  width: 100%;

  overflow: hidden;

  display: grid;
  gap: $unnnic-spacing-ant;

  &__header {
    width: 100%;

    display: flex;
    justify-content: space-between;

    .header__title {
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-bold;
    }

    .header__see-more {
      font-family: Lato;
      font-weight: $unnnic-font-weight-bold;
      text-decoration-line: underline;
      text-underline-position: under;
    }

    .header__title,
    .header__see-more {
      font-size: $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-dark;
    }
  }

  &__chart {
    display: flex;

    overflow: hidden;

    .chart__loading {
      margin: auto;
    }
  }
}
</style>
