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

import { deepMerge } from '@/utils/object';

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
];

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

  computed: {
    mergedOptions() {
      const defaultOptions = {
        maintainAspectRatio: false,
        responsive: true,
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
};
</script>
