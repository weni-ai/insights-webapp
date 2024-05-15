<template>
  <section class="bar-chart">
    <header class="bar-chart__header">
      <h1 class="header__title">{{ title }}</h1>
      <a
        class="header__see-more"
        v-if="seeMore"
        href="#"
        >Ver mais</a
      >
    </header>
    <section>
      <BaseChart
        type="bar"
        :data="chartData"
        :options="chartOptions"
        :plugins="chartPlugins"
      />
    </section>
  </section>
</template>

<script>
import BaseChart from './BaseChart.vue';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export default {
  name: 'BarChart',
  components: { BaseChart },
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
  },
  computed: {
    chartOptions() {
      return {
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

<style lang="scss">
.bar-chart {
  display: grid;
  gap: $unnnic-spacing-sm;

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
    }

    .header__title,
    .header__see-more {
      font-size: $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-dark;
    }
  }
}
</style>
