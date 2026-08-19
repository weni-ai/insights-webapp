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

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Tooltip } from 'chart.js';

import BaseChart from './BaseChart.vue';
import SkeletonLineChart from './loadings/SkeletonLineChart.vue';
import i18n from '@/utils/plugins/i18n';
import { deepMerge } from '@/utils/object';
import {
  colorBgTealStrong,
  colorGray12,
} from '@weni/unnnic-system/tokens/colors';

defineOptions({ name: 'LineChart' });

interface LineChartProps {
  title?: string;
  seeMore?: boolean;
  chartData: Record<string, unknown>;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<LineChartProps>(), {
  title: '',
  seeMore: false,
  isLoading: false,
});

defineEmits<{
  seeMore: [];
}>();

const lineChart = ref<HTMLElement | null>(null);
const { width: chartWidth, height: chartHeight } = useElementSize(lineChart);

const mergedData = computed(() => {
  const configData = {
    fill: true,
    borderColor: colorBgTealStrong,
    pointRadius: 0,
    hoverRadius: 3,
    pointStyle: 'circle',
    backgroundColor: function (context: any) {
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

      gradient.addColorStop(0, colorBgTealStrong);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      return gradient;
    },
  };

  return deepMerge(
    {
      datasets: [{ ...configData }],
    },
    props.chartData,
  );
});

const chartOptions = computed(() => {
  return {
    backgroundColor: colorBgTealStrong,
    hoverBackgroundColor: colorBgTealStrong,
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
        backgroundColor: colorGray12,
        displayColors: false,
        font: {
          size: '16',
          weight: '700',
        },
        callbacks: {
          title: function (tooltipItems: any[]) {
            return `${i18n.global.t('charts.hours')}: ${tooltipItems[0].label}`;
          },
          label: function (tooltipItem: any) {
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
});

const chartPlugins = computed(() => [ChartDataLabels, Tooltip]);
</script>

<style lang="scss" scoped>
.line-chart {
  border-radius: $unnnic-space-2;
  border: 1px solid $unnnic-color-gray-2;
  background: $unnnic-color-gray-0;

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
      font: $unnnic-font-action;
      text-decoration-line: underline;
      text-underline-position: under;
      color: $unnnic-color-gray-10;
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
