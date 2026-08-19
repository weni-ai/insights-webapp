<template>
  <section class="bar-chart">
    <header class="bar-chart__header">
      <h1
        class="header__title"
        data-testid="chart-title"
      >
        {{ title }}
      </h1>
      <a
        v-if="seeMore"
        class="header__see-more"
        href="#"
        data-testid="chart-see-more-link"
        @click.prevent.stop="$emit('seeMore')"
      >
        {{ $t('view_more') }}
      </a>
    </header>
    <section
      ref="barChart"
      class="bar-chart__chart"
    >
      <SkeletonBarChart
        v-if="isLoading"
        class="chart__loading"
        data-testid="chart-loading"
        :width="chartWidth"
        :height="chartHeight"
      />
      <BaseChart
        v-else
        type="bar"
        data-testid="chart-bar"
        :data="mergedData"
        :options="chartOptions"
        :plugins="chartPlugins"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useElementSize } from '@vueuse/core';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import BaseChart from './BaseChart.vue';
import SkeletonBarChart from './loadings/SkeletonBarChart.vue';
import { deepMerge } from '@/utils/object';
import {
  colorBgTealStrong,
  colorBgTealPlain,
  colorTeal12,
  colorFgInverted,
} from '@weni/unnnic-system/tokens/colors';

defineOptions({ name: 'BarChart' });

interface BarChartProps {
  title?: string;
  seeMore?: boolean;
  chartData: Record<string, unknown>;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<BarChartProps>(), {
  title: '',
  seeMore: false,
  isLoading: false,
});

defineEmits<{
  seeMore: [];
}>();

const barChart = ref<HTMLElement | null>(null);
const { width: chartWidth, height: chartHeight } = useElementSize(barChart);

const mergedData = computed(() => {
  return deepMerge(
    {
      datasets: [{ borderSkipped: false, minBarLength: 35 }],
    },
    props.chartData,
  );
});

const chartOptions = computed(() => {
  return {
    backgroundColor: colorBgTealStrong,
    hoverBackgroundColor: colorBgTealPlain,
    plugins: {
      tooltip: false,
      datalabels: {
        color: function (context: { active: boolean }) {
          return context.active ? colorTeal12 : colorFgInverted;
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
});

const chartPlugins = computed(() => [ChartDataLabels]);
</script>

<style lang="scss" scoped>
.bar-chart {
  box-shadow: $unnnic-shadow-1;

  padding: $unnnic-space-3;

  height: 100%;
  width: 100%;

  overflow: hidden;

  display: grid;
  gap: $unnnic-space-3;

  &__header {
    width: 100%;

    display: flex;
    justify-content: space-between;

    .header__see-more {
      text-decoration-line: underline;
      text-underline-position: under;
    }

    .header__title,
    .header__see-more {
      font: $unnnic-font-action;
      color: $unnnic-color-gray-10;
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
