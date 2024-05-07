<template>
  <section class="column-charts">
    <header class="column-charts__header">
      <h1 class="header__title">{{ title }}</h1>
      <a
        class="header__see-more"
        v-if="seeMore"
        href="#"
        >Ver mais</a
      >
    </header>
    <!-- Use "Apexchart" (with PascalCase) brake the component -->
    <!-- eslint-disable-next-line -->
  <apexchart
      width="100%"
      height="100%"
      type="bar"
      :options="options"
      :series="series"
    />
  </section>
</template>

<script>
export default {
  name: 'ColumnChart',
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
  data: () => ({
    options: {
      chart: {
        id: 'column-chart',
        plotPadding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      xaxis: {
        categories: [],
        labels: {
          offsetY: -5,
        },
      },
    },
    series: [
      {
        data: [],
      },
    ],
  }),
  created() {
    this.importData();
  },
  methods: {
    importData() {
      this.options.xaxis.categories = this.chartData.categories;
      this.series[0].data = this.chartData.data;
    },
  },
};
</script>

<style lang="scss">
.column-charts {
  position: relative;
  margin: $unnnic-spacing-xs 0 $unnnic-spacing-md;

  &__header {
    position: absolute;
    top: $unnnic-spacing-sm;
    z-index: 1;

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
