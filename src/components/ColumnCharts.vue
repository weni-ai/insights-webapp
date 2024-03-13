<template>
  <apexchart width="500" type="bar" :options="options" :series="series" />
</template>

<script>
export default {
  name: 'ColumnChart',
  props: {
    chartData: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    options: {
      colors: ['var(--unnnic-color-neutral-clean)'],
      chart: {
        id: 'column-chart',
        toolbar: {
          show: false,
        },
        fontFamily: '$unnnic-font-family-secondary',
      },
      grid: {
        show: false,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
      xaxis: {
        categories: [],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
      dataLabels: {
        enabled: false,
        enabledOnSeries: false,
      },
    },
    series: [
      {
        name: 'Atendimentos',
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
