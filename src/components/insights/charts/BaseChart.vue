<template>
  <canvas
    ref="baseChartCanvas"
    :style="chartStyles"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
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
  Filler,
} from 'chart.js';

import { deepMerge } from '@/utils/object';

defineOptions({ name: 'BaseChart' });

interface BaseChartProps {
  data: Record<string, unknown>;
  options?: Record<string, unknown>;
  style?: Record<string, unknown>;
  type?: string;
  plugins?: unknown[];
}

const props = withDefaults(defineProps<BaseChartProps>(), {
  options: () => ({}),
  style: () => ({}),
  type: 'bar',
  plugins: () => [],
});

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
  Filler,
];

const mergedOptions = computed(() => {
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
  return deepMerge(defaultOptions, props.options);
});

const chartStyles = computed(() => {
  const defaultStyles = {};
  return deepMerge(defaultStyles, props.style);
});

const baseChartCanvas = ref<HTMLCanvasElement | null>(null);

const pluginsToRegister = [...defaultPlugins, ...props.plugins];
ChartJS.defaults.font.family = 'Inter, sans-serif';
ChartJS.register(...pluginsToRegister);

onMounted(() => {
  new ChartJS(baseChartCanvas.value, {
    type: props.type,
    data: props.data,
    options: mergedOptions.value,
  });
});
</script>
