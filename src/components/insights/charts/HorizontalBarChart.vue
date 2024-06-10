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
    <section class="bar-chart__chart">
      <IconLoading
        v-if="isLoading"
        class="chart__loading"
      />
      <BaseChart
        v-else
        type="bar"
        :data="mergedData"
        :options="chartOptions"
        :plugins="chartPlugins"
      />
    </section>
  </section>
</template>

<script>
import IconLoading from '@/components/IconLoading.vue';
import BaseChart from './BaseChart.vue';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { deepMerge } from '@/utils/object';

export default {
  name: 'HorizontalBarChart',

  components: { IconLoading, BaseChart },

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
    datalabelsTemplate: {
      type: String,
      default: '{{value}}',
    },
    isLoading: Boolean,
  },

  emits: ['seeMore'],

  computed: {
    mergedData() {
      return deepMerge(
        {
          datasets: [{ axis: 'y', borderSkipped: false }],
        },
        this.chartData,
      );
    },
    chartOptions() {
      return {
        indexAxis: 'y',
        scales: {
          x: {
            display: false,
          },
          y: {
            display: true,
            ticks: {
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
            formatter: (value) => {
              return this.datalabelsTemplate.replace('{{value}}', value);
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
    height: fit-content;
    overflow: hidden;

    .chart__loading {
      margin: auto;
    }
  }
}
</style>
