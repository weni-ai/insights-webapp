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
      ref="lineChart"
      class="line-chart__chart"
    >
      <SkeletonLineChart
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
import SkeletonLineChart from './loadings/SkeletonLineChart.vue';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import i18n from '@/utils/plugins/i18n';
import { useElementSize } from '@vueuse/core';
import { ref } from 'vue';

import { deepMerge } from '@/utils/object';
import { Tooltip } from 'chart.js';
import { colorTeal600, colorGray950 } from '@weni/unnnic-system/tokens/colors';

export default {
  name: 'LineChart',

  components: { BaseChart, SkeletonLineChart },

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
    const lineChart = ref(null);
    const { width, height } = useElementSize(lineChart);

    return {
      lineChart,
      chartWidth: width,
      chartHeight: height,
    };
  },

  computed: {
    mergedData() {
      const configData = {
        fill: true,
        borderColor: colorTeal600,
        pointRadius: 0,
        hoverRadius: 3,
        pointStyle: 'circle',
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

          gradient.addColorStop(0, colorTeal600);
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
        backgroundColor: colorTeal600,
        hoverBackgroundColor: colorTeal600,
        pointStyle: false,
        layout: {
          padding: 10,
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 20,
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
            backgroundColor: colorGray950,
            displayColors: false,
            font: {
              size: '16',
              weight: '700',
            },
            callbacks: {
              title: function (tooltipItems) {
                return `${i18n.global.t('charts.hours')}: ${tooltipItems[0].label}`;
              },
              label: function (tooltipItem) {
                const originalValue = tooltipItem.raw;
                return `${i18n.global.t('charts.attendances')}: ${originalValue}`;
              },
            },
          },
          doubleDataLabel: {
            display: false,
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
  border-radius: $unnnic-space-2;
  border: 1px solid $unnnic-color-neutral-soft;
  background: $unnnic-color-neutral-white;

  padding: $unnnic-space-6;

  height: 100%;
  width: 100%;

  overflow: hidden;

  display: grid;
  gap: $unnnic-space-3;

  &__header {
    width: 100%;

    display: flex;
    justify-content: space-between;

    .header__title {
      font: $unnnic-font-display-2;
    }

    .header__see-more {
      font-family: Lato;
      font-weight: $unnnic-font-weight-bold;
      text-decoration-line: underline;
      text-underline-position: under;
    }

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
