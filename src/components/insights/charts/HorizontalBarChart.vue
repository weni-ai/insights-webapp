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
        data-testid="chart-loading"
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
          data-testid="chart-bar"
          :data="mergedData"
          :options="chartOptions"
          :plugins="chartPlugins"
        />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Tooltip } from 'chart.js';

import BaseChart from './BaseChart.vue';
import SkeletonHorizontalBarChart from './loadings/SkeletonHorizontalBarChart.vue';
import { deepMerge } from '@/utils/object';
import {
  colorBgTealStrong,
  colorBgTealPlain,
  colorFgMuted,
  colorBorderBase,
} from '@weni/unnnic-system/tokens/colors';

defineOptions({ name: 'HorizontalBarChart' });

interface HorizontalChartData {
  labels?: string[];
  datasets?: { data?: number[]; [key: string]: unknown }[];
  [key: string]: unknown;
}

interface HorizontalBarChartProps {
  title?: string;
  seeMore?: boolean;
  chartData: HorizontalChartData;
  datalabelsSuffix?: string;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<HorizontalBarChartProps>(), {
  title: '',
  seeMore: false,
  datalabelsSuffix: '',
  isLoading: false,
});

const emit = defineEmits<{
  seeMore: [];
  clickData: [
    payload: {
      label: string | undefined;
      data: number | undefined;
      datasetIndex: number;
      dataIndex: number;
    },
  ];
}>();

const horizontalBarChart = ref<HTMLElement | null>(null);
const { width: chartWidth, height: chartHeight } =
  useElementSize(horizontalBarChart);

const mergedData = computed(() => {
  return deepMerge(
    {
      datasets: [
        {
          axis: 'y',
          borderSkipped: false,
        },
      ],
    },
    props.chartData,
  );
});

const chartOptions = computed(() => {
  return {
    indexAxis: 'y',
    barThickness: 32,
    maintainAspectRatio: false,
    layout: {
      padding: {
        right: 140,
      },
    },
    scales: {
      x: {
        display: false,
        beginAtZero: true,
        max: 100, // 100%
      },
      y: {
        display: true,
        autoSkip: false,
        maxRotation: 0,
        ticks: {
          callback: (_value: unknown, index: number) => {
            const label = String(props.chartData.labels?.[index]);
            return label.length > 15 ? `${label.substring(0, 15)}...` : label;
          },
          padding: 0,
          font: { lineHeight: 1.66, size: 12, weight: 400 },
        },
        grid: {
          display: false,
        },
      },
    },
    backgroundColor: colorBgTealStrong,
    hoverBackgroundColor: colorBgTealPlain,
    plugins: {
      datalabels: {
        display: false,
      },
      doubleDataLabel: {
        datalabelsSuffix: props.datalabelsSuffix,
      },
      horizontalBackgroundColorPlugin: {
        backgroundColor: colorBgTealPlain,
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        callbacks: {
          label: () => false,
        },
      },
    },
    onHover(event: any, elements: any[]) {
      event.native.target.style.cursor = elements[0] ? 'pointer' : 'default';
    },
    onClick: (_event: unknown, elements: any[]) => {
      if (!elements.length) return;

      const datasetIndex = elements[0].datasetIndex;
      const dataIndex = elements[0].index;
      emit('clickData', {
        label: props.chartData?.labels?.[dataIndex],
        data: props.chartData?.datasets?.[datasetIndex]?.data?.[dataIndex],
        datasetIndex,
        dataIndex,
      });
    },
  };
});

const horizontalBackgroundColorPlugin = computed(() => {
  return {
    id: 'horizontalBackgroundColorPlugin',
    beforeDatasetsDraw(chart: any, _args: unknown, plugins: any) {
      const {
        ctx,
        data,
        chartArea: { left, width },
        scales: { y },
      } = chart;

      const barThickness = chart.getDatasetMeta(0).data[0].height;

      ctx.beginPath();
      ctx.fillStyle = plugins.backgroundColor;

      data.datasets[0].data.forEach((_dataPoint, index) => {
        ctx.roundRect(
          left, // start position
          y.getPixelForValue(index) - barThickness / 2, // align background to center bar
          width,
          barThickness,
          4, // border radius
        );
      });
      ctx.fill();
    },
  };
});

const doubleDataLabel = computed(() => {
  return {
    id: 'doubleDataLabel',
    afterDatasetsDraw(chart: any, _args: unknown, plugins: any) {
      if (plugins.display === false) return;
      const {
        ctx,
        data: { datasets },
        chartArea: { width, left: chartLeftMargin },
      } = chart;

      ctx.save();

      chart.getDatasetMeta(0).data.forEach((dataPoint, index) => {
        const { data, fullValues } = datasets[0];

        ctx.textBaseline = 'middle';
        ctx.font = 'bold 16px Inter';
        ctx.fillStyle = colorFgMuted;

        // chartLeftMargin is the margin between the chart and the left edge of the chart area (labels space)
        // 4px is the margin between the chart and the text
        const startTextPosition = width + chartLeftMargin + 4;

        ctx.fillText(
          `${data[index]} ${plugins.datalabelsSuffix}`,
          startTextPosition,
          dataPoint.y,
        );

        const valueCharCount = String(data[index]).length;

        const widthCompensationMap: Record<number, number> = {
          1: 30,
          2: 38,
          3: 40,
          4: 50,
          5: 60,
        };

        ctx.font = 'normal 14px Inter';
        ctx.fillStyle = colorBorderBase;

        ctx.fillText(
          `| ${fullValues[index]}`,
          startTextPosition + (widthCompensationMap[valueCharCount] || 0),
          dataPoint.y,
        );
      });
    },
  };
});

const chartPlugins = computed(() => {
  return [
    ChartDataLabels,
    Tooltip,
    horizontalBackgroundColorPlugin.value,
    doubleDataLabel.value,
  ];
});

const graphContainerHeight = computed(() => {
  const barSpacingY = 4;
  const paddingY = 24;
  const totalBars = mergedData.value.datasets?.[0]?.data?.length || 0;

  return totalBars * (chartOptions.value.barThickness + barSpacingY) + paddingY;
});
</script>

<style lang="scss" scoped>
.bar-chart {
  box-shadow: $unnnic-shadow-1;

  padding: $unnnic-space-3;

  height: 100%;
  width: 100%;

  overflow: hidden;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-3;

  &__header {
    width: 100%;

    display: flex;
    justify-content: space-between;

    .header__title {
      font: $unnnic-font-display-2;
      color: $unnnic-color-gray-10;
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
