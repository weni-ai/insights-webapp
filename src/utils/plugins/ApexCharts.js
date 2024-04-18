import VueApexCharts from 'vue3-apexcharts';

/* Global ApexChart settings */
window.Apex = {
  colors: ['#00A49F'],
  chart: {
    offsetY: 0,
    parentHeightOffset: 0,
    redrawOnParentResize: true,
    FontFamily: 'Lato, sans-serif',
    toolbar: {
      show: false,
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
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        fontFamily: 'Lato, sans-serif',
        fontSize: '8px',
      },
    },
  },
  yaxis: {
    show: false,
    labels: {
      style: {
        fontFamily: 'Lato, sans-serif',
      },
    },
  },
  dataLabels: {
    enabled: false,
    enabledOnSeries: false,
    style: {
      fontFamily: 'Lato, sans-serif',
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '90%',
      colors: {
        backgroundBarOpacity: 1,
      },
    },
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    enabled: false,
  },
};

export default VueApexCharts;
