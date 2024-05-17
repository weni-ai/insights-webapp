<template>
  <canvas
    ref="baseChartCanvas"
    :style="chartStyles"
  />
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  LineController,
  BarController,
} from 'chart.js';
import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel';

const defaultPlugins = [
  Title,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  LineController,
  BarController,
  FunnelController,
  TrapezoidElement,
];

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

export default {
  name: 'BaseChart',
  props: {
    data: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    style: {
      type: Object,
      default: () => ({}),
    },
    type: {
      type: String,
      default: 'bar',
      validator: (value) =>
        [
          'bar',
          'line',
          'pie',
          'doughnut',
          'radar',
          'polarArea',
          'bubble',
          'scatter',
          'funnel',
        ].includes(value),
    },
    plugins: {
      type: Array,
      default: () => [],
    },
  },

  created() {
    const pluginsToRegister = [...defaultPlugins, ...this.plugins];
    ChartJS.defaults.font.family = 'Lato, sans-serif';
    ChartJS.register(...pluginsToRegister);
  },

  mounted() {
    new ChartJS(this.$refs.baseChartCanvas, {
      type: this.type,
      data: this.data,
      options: this.mergedOptions,
    });
  },

  computed: {
    mergedOptions() {
      const defaultOptions = {
        maintainAspectRatio: false,
        responsive: true,
        backgroundColor: '#00A49F',
        hoverBackgroundColor: '#00DED2',
        barPercentage: 1.1,
        chart: {
          height: 100,
        },
        scales: {
          x: {
            grid: {
              display: false,
            },

            ticks: {
              padding: -2,
            },
          },
          y: {
            display: false,
          },
        },
        elements: {
          bar: {
            borderRadius: 4,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      };
      return deepMerge(defaultOptions, this.options);
    },
    chartStyles() {
      const defaultStyles = {};
      return deepMerge(defaultStyles, this.style);
    },
  },
};
</script>
