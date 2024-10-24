<template>
  <section class="line-chart">
    <header class="line-chart__header">
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
      class="line-chart__chart"
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
        type="line"
        data-testid="line-chart"
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
import i18n from '@/utils/plugins/i18n';
import { useElementSize } from '@vueuse/core';
import { ref } from 'vue';

import { deepMerge } from '@/utils/object';
import { Tooltip } from 'chart.js';

export default {
  name: 'LineChart',

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
      const configData = {
        fill: true,
        borderColor: '#00A49F',
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return null;
          }
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );

          gradient.addColorStop(0, '#00A49F');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          return gradient;
        },
      };

      return deepMerge(
        {
          datasets: [{ ...configData }],
        },
        this.chartData,
      );
    },
    chartOptions() {
      return {
        backgroundColor: '#00A49F',
        hoverBackgroundColor: '#00A49F',
        pointStyle: false,
        layout: {
          padding: 10,
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMin: 0,
            display: true,
          },
          x: {
            grid: {
              display: true,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          tooltip: {
            enabled: true,
            backgroundColor: '#272B33',
            usePointStyle: true,
            padding: {
              right: 10,
              top: 8,
              bottom: 8,
            },
            font: {
              size: '16',
              weight: '700',
            },
            callbacks: {
              title: function (tooltipItems) {
                return `${' '.repeat(6)}${i18n.global.t('charts.hours')}: ${tooltipItems[0].label}`;
              },
              label: function (tooltipItem) {
                const originalValue = tooltipItem.raw;
                return `${i18n.global.t('charts.attendances')}: ${originalValue}`;
              },
            },
          },
          datalabels: {
            display: false,
          },
        },
      };
    },
    chartPlugins() {
      return [ChartDataLabels, Tooltip];
    },
  },
};
</script>

<style lang="scss" scoped>
.line-chart {
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
