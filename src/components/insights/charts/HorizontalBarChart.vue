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

  emits: ['seeMore', 'clickData'],

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
              callback: (_value, index) => {
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
          datalabels: {
            display: false,
          },
          doubleDataLabel: {
            datalabelsSuffix: this.datalabelsSuffix,
          },
          horizontalBackgroundColorPlugin: {
            backgroundColor: '#C6FFF7',
          },
          tooltip: {
            enabled: true,
            mode: 'index',
            callbacks: {
              label: () => false,
            },
          },
        },
        onHover(event, elements) {
          event.native.target.style.cursor = elements[0]
            ? 'pointer'
            : 'default';
        },
        onClick: (event, elements) => {
          if (!elements.length) return;

          const datasetIndex = elements[0].datasetIndex;
          const dataIndex = elements[0].index;
          this.$emit('clickData', {
            label: this.chartData?.labels?.[dataIndex],
            data: this.chartData?.datasets?.[datasetIndex]?.data?.[dataIndex],
            datasetIndex,
            dataIndex,
          });
        },
      };
    },
    horizontalBackgroundColorPlugin() {
      return {
        id: 'horizontalBackgroundColorPlugin',
        beforeDatasetsDraw(chart, _args, plugins) {
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
    },
    doubleDataLabel() {
      return {
        id: 'doubleDataLabel',
        afterDatasetsDraw(chart, _args, plugins) {
          if (plugins.display === false) return;
          const {
            ctx,
            data: { datasets },
            chartArea: { width },
          } = chart;

          ctx.save();

          chart.getDatasetMeta(0).data.forEach((dataPoint, index) => {
            const { data, fullValues } = datasets[0];

            ctx.textBaseline = 'middle';
            ctx.font = 'bold 16px Lato';
            ctx.fillStyle = '#4E5666';

            const startTextPosition = width + 100;

            ctx.fillText(
              `${data[index]} ${plugins.datalabelsSuffix}`,
              startTextPosition,
              dataPoint.y,
            );

            const valueCharCount = String(data[index]).length;

            const widthCompensationMap = {
              1: 30,
              3: 40,
              4: 50,
              5: 60,
            };

            ctx.font = 'normal 14px Lato';
            ctx.fillStyle = '#67738B';

            ctx.fillText(
              `| ${fullValues[index]}`,
              startTextPosition + widthCompensationMap[valueCharCount] || 0,
              dataPoint.y,
            );
          });
        },
      };
    },
    chartPlugins() {
      return [
        ChartDataLabels,
        Tooltip,
        this.horizontalBackgroundColorPlugin,
        this.doubleDataLabel,
      ];
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
