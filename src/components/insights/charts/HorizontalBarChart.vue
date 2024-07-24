<template>
  <section class="bar-chart">
    <header class="bar-chart__header">
      <h1 class="header__title">{{ title }}</h1>
      <a
        v-if="seeMore"
        class="header__see-more"
        href="#"
        @click.prevent="$emit('seeMore')"
      >
        {{ $t('view_more') }}
      </a>
    </header>
    <section
      ref="horizontalBarChart"
      class="bar-chart__chart"
    >
      <SkeletonHorizontalBarChart
        v-if="isLoading"
        class="chart__loading"
        :width="chartWidth"
        :height="chartHeight"
      />
      <section
        v-else
        class="bar-chart__chart__container"
        :style="{
          display: !!graphContainerHeight ? 'flex' : 'none',
          height: `${graphContainerHeight}px`,
        }"
      >
        <BaseChart
          type="bar"
          :data="mergedData"
          :options="chartOptions"
          :plugins="chartPlugins"
        />
      </section>
    </section>
  </section>
</template>

<script>
import BaseChart from './BaseChart.vue';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import SkeletonHorizontalBarChart from './loadings/SkeletonHorizontalBarChart.vue';

import { Tooltip } from 'chart.js';
import { deepMerge } from '@/utils/object';

import { useElementSize } from '@vueuse/core';
import { ref } from 'vue';

export default {
  name: 'HorizontalBarChart',

  components: { BaseChart, SkeletonHorizontalBarChart },

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
    datalabelsSuffix: {
      type: String,
      default: '',
    },
    isLoading: Boolean,
  },

  emits: ['seeMore'],

  setup() {
    const horizontalBarChart = ref(null);
    const { width, height } = useElementSize(horizontalBarChart);

    return {
      horizontalBarChart,
      chartWidth: width,
      chartHeight: height,
    };
  },

  computed: {
    mergedData() {
      return deepMerge(
        {
          datasets: [
            {
              axis: 'y',
              borderSkipped: false,
              minBarLength: 56,
            },
          ],
        },
        this.chartData,
      );
    },
    chartOptions() {
      return {
        indexAxis: 'y',
        barThickness: 32,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: false,
          },
          y: {
            display: true,
            autoSkip: false,
            maxRotation: 0,
            ticks: {
              callback: (value, index) => {
                const label = String(this.chartData.labels[index]);
                return label.length > 15
                  ? `${label.substring(0, 15)}...`
                  : label;
              },
              padding: 0,
              font: { lineHeight: 1.66, size: 12, weight: 400 },
            },
            grid: {
              display: false,
            },
          },
        },
        backgroundColor: '#00A49F',
        hoverBackgroundColor: '#00DED2',
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'index',
            callbacks: {
              label: () => false,
            },
          },
          datalabels: {
            formatter: (value) => {
              return value + this.datalabelsSuffix;
            },
            color: '#fff',
            anchor: 'end',
            align: 'start',
            textStrokeColor: '#fff',
            font: {
              size: '12',
              weight: '700',
              lineHeight: 1.66,
            },
          },
        },
      };
    },
    chartPlugins() {
      return [ChartDataLabels, Tooltip];
    },
    graphContainerHeight() {
      const barSpacingY = 4;
      const paddingY = 24;
      const totalBars = this.mergedData.datasets?.[0]?.data?.length || 0;

      return (
        totalBars * (this.chartOptions.barThickness + barSpacingY) + paddingY
      );
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

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-ant;

  &__header {
    width: 100%;

    display: flex;
    justify-content: space-between;

    .header__title {
      font-size: $unnnic-font-size-title-sm;
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-bold;
      color: $unnnic-color-neutral-dark;
    }

    .header__see-more {
      font-size: $unnnic-font-size-body-gt;
      font-family: Lato;
      font-weight: $unnnic-font-weight-bold;
      text-decoration-line: underline;
      text-underline-position: under;
      color: $unnnic-color-neutral-dark;
    }
  }

  &__chart {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden auto;

    &__container {
      width: 100%;
    }

    .chart__loading {
      margin: auto;
    }
  }
}
</style>
