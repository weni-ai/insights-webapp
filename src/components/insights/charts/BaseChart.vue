<template>
  <component
    :is="chartComponent"
    :data="data"
    :options="mergedOptions"
    :style="chartStyles"
  />
</template>

<script>
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Bubble,
  Scatter,
} from 'vue-chartjs';
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
} from 'chart.js';

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
];

const chartComponents = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
  radar: Radar,
  polarArea: PolarArea,
  bubble: Bubble,
  scatter: Scatter,
};

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
      const defaultStyles = {
        height: '100%',
        width: '100%',
      };
      return deepMerge(defaultStyles, this.style);
    },
    chartComponent() {
      return chartComponents[this.type] || chartComponents['bar'];
    },
  },
};
</script>
