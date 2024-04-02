<!-- eslint-disable vue/component-name-in-template-casing -->
<template>
  <apexchart
    type="bar"
    :options="options"
    :series="series"
  />
</template>

<script>
export default {
  name: 'BarChart',
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
        id: 'bar-chart',
        toolbar: {
          show: false,
        },
        fontFamily: '$unnnic-font-family-secondary',
        fontWeight: '$unnnic-font-weight-regular;',
      },
      stroke: {
        colors: ['transparent'],
        width: 0,
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '$unnnic-font-size-body-md',
          fontWeight: '$unnnic-font-weight-regular;',
        },
        formatter: function (val) {
          return val + ' runs';
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '80%',
        },
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
        labels: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: true,
          align: 'left',
          minWidth: 0,
          maxWidth: 160,
          style: {
            fontSize: '$unnnic-font-size-body-md',
            fontWeight: '$unnnic-font-weight-regular;',
          },
        },
      },
    },
    series: [
      {
        name: 'Runs',
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
