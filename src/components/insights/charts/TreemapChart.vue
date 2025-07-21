<template>
  <section
    ref="treemapChart"
    data-testid="treemap-chart"
    class="treemap-chart"
  >
    <p
      v-if="data.length === 0"
      data-testid="treemap-chart-no-data"
      class="treemap-chart__no-data"
    >
      {{ $t('widgets.treemap.no_data') }}
    </p>

    <canvas
      v-else
      ref="treemapCanvas"
      data-testid="treemap-canvas"
      class="treemap-chart__canvas"
      height="100%"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';

import { addColors, prepareTopData, TreemapDataItem } from '@/utils/treemap';
import i18n from '@/utils/plugins/i18n';

ChartJS.defaults.font.family = 'Lato, sans-serif';
ChartJS.register(TreemapController, TreemapElement, LinearScale, Tooltip);

const treemapCanvas = ref<HTMLCanvasElement | null>(null);
const treemapChart = ref<HTMLDivElement | null>(null);

const emit = defineEmits<{
  (_event: 'click', _data: TreemapDataItem);
}>();

const props = defineProps<{
  data: TreemapDataItem[] | [];
}>();

const preparedData = prepareTopData(props.data);
const coloredData = addColors(preparedData);

onMounted(() => {
  new ChartJS(treemapCanvas.value, {
    type: 'treemap',
    data: {
      datasets: [
        {
          tree: coloredData as any,
          key: 'value',
          borderWidth: 0,
          borderRadius: 8,
          spacing: 4,

          backgroundColor(ctx: any) {
            if (ctx.type !== 'data') {
              return 'transparent';
            }
            return ctx.raw._data.color;
          },
          hoverBackgroundColor: (ctx: any) => {
            if (ctx.type !== 'data') {
              return 'transparent';
            }
            return ctx.raw._data.hoverColor;
          },
          labels: {
            display: true,
            align: 'left',
            overflow: 'hidden',
            formatter(ctx: any) {
              if (ctx.type !== 'data') return;

              const data = ctx.raw._data;
              const padding = '    ';
              // Yes, this is a workaround to add padding to the label.
              // Each space here is 4px, so 4 spaces is 16px :)
              return [
                `${padding}${data.label} (${data.percentage}%)${padding}`,
                `${padding}${data.value} ${i18n.global.t('conversations_dashboard.conversations')}${padding}`,
              ];
            },
            color: '#3B414D',
            hoverColor: '#3B414D',
            font: [
              {
                size: 16,
                family: 'Lato, sans-serif',
                lineHeight: '26px',
                weight: 'bold',
              },
              { size: 14, family: 'Lato, sans-serif', lineHeight: '24px' },
            ],
            position: 'middle',
          },
          captions: {
            display: true,
            align: 'center',
            formatter(ctx) {
              if (ctx.type !== 'data') return;

              return `${ctx.raw.v} ${i18n.global.t('conversations_dashboard.conversations')}`;
            },
          },
        },
      ] as any,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        datalabels: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#272B33',
          displayColors: false,
          position: 'nearest',
          caretPadding: (ctx: any) => {
            return (ctx.tooltipItems[0]?.element.height || 0) / 2;
          },
          padding: 10,
          intersect: true,
          mode: 'index',
          titleFont: { size: 12, family: 'Lato, sans-serif', weight: 'bold' },
          bodyFont: { size: 12, family: 'Lato, sans-serif' },
          yAlign: 'bottom',
          callbacks: {
            title: function (ctx: any) {
              const data = ctx[0].raw._data;
              return `${data.label} (${data.percentage}%)`;
            },
            label: function (ctx: any) {
              return `${ctx.raw._data.value} ${i18n.global.t('conversations_dashboard.conversations')}`;
            },
          },
        },
      },
      onClick: (_el, ctx: any) => {
        if (!ctx[0]) return;
        emit('click', ctx[0].element.$context.raw._data);
      },
      onHover: (el: any) => {
        if (!el.chart) return;
        el.chart.canvas.style.cursor = 'pointer';
      },
    },
  });
});
</script>

<style lang="scss" scoped>
.treemap-chart {
  height: 100%;
  width: calc(
    100% + 12px
  ); // 12px is the compensation for the  visual padding to the chart

  &__no-data {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: $unnnic-font-size-body-gt;
    font-family: $unnnic-font-family-secondary;
    color: $unnnic-color-neutral-cloudy;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__canvas {
    transform: translateX(-6px); // Need to remove visual padding from the chart
  }
}
</style>
