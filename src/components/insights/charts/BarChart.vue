<template>
  <section class="bar-chart">
    <header class="bar-chart__header">
      <h1 class="header__title">{{ title }}</h1>
      <a
        v-if="seeMore"
        class="header__see-more"
        href="#"
        @click="$emit('seeMore')"
        >Ver mais</a
      >
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
  name: 'BarChart',

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
    isLoading: Boolean,
  },

  computed: {
    mergedData() {
      return deepMerge(
        {
          datasets: [{ borderSkipped: false }],
        },
        this.chartData,
      );
    },
    chartOptions() {
      return {
        backgroundColor: '#00A49F',
        hoverBackgroundColor: '#00DED2',
        plugins: {
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
