<template>
  <section
    ref="treemapChart"
    data-testid="treemap-chart"
    class="treemap-chart"
  >
    <section
      v-if="isLoading"
      class="treemap-chart__loading"
      data-testid="treemap-chart-loading"
    >
      <UnnnicSkeletonLoading
        v-for="i in 5"
        :key="i"
        :class="`loading__skeleton loading__skeleton--${i}`"
        data-testid="treemap-chart-loading-skeleton"
      />
    </section>

    <section
      v-else-if="data.length === 0"
      data-testid="treemap-chart-no-data"
      class="treemap-chart__no-data"
    >
      <p
        data-testid="treemap-chart-no-data"
        class="no-data__title"
      >
        {{ $t('widgets.treemap.no_data') }}
      </p>
      <p
        data-testid="treemap-chart-no-data"
        class="no-data__description"
      >
        {{ $t('widgets.treemap.no_data_description') }}
      </p>
    </section>

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
import { ref, onMounted, computed, watch } from 'vue';
import { Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import type { topicDistributionMetric } from '@/services/api/resources/conversational/topics';
import { addColors, prepareTopData } from '@/utils/treemap';
import i18n from '@/utils/plugins/i18n';

ChartJS.defaults.font.family = 'Lato, sans-serif';
ChartJS.register(TreemapController, TreemapElement, LinearScale, Tooltip);

const treemapCanvas = ref<HTMLCanvasElement | null>(null);
const treemapChart = ref<HTMLDivElement | null>(null);

const emit = defineEmits<{
  (_event: 'click', _data: topicDistributionMetric);
}>();

const props = defineProps<{
  data: topicDistributionMetric[] | [];
  isLoading?: boolean;
}>();

const preparedData = computed(() => prepareTopData(props.data));
const coloredData = computed(() => addColors(preparedData.value));

let chart: ChartJS | null = null;

const createOrUpdateChart = () => {
  if (chart) {
    chart.destroy();
    chart = null;
  }

  if (treemapCanvas.value) {
    chart = new ChartJS(treemapCanvas.value, {
      type: 'treemap',
      data: {
        datasets: [
          {
            tree: coloredData.value as any,
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
              overflow: 'fit',
              formatter(ctx: any) {
                if (ctx.type !== 'data') return;

                const data = ctx.raw._data;

                // Don't show text if percentage is less than 5%
                if (data.percentage < 5) return '';

                const padding = '    ';
                const maxLabelLength = 25;

                // Truncate label with ellipsis if too long
                let labelText = data.label;
                if (labelText.length > maxLabelLength) {
                  labelText =
                    labelText.substring(0, maxLabelLength - 3) + '...';
                }

                // Yes, this is a workaround to add padding to the label.
                // Each space here is 4px, so 4 spaces is 16px :)
                return [
                  `${padding}${labelText} (${data.percentage}%)${padding}`,
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

                const data = ctx.raw._data;

                // Don't show caption if percentage is less than 5%
                if (data.percentage < 5) return '';

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
            titleFont: {
              size: 12,
              family: 'Lato, sans-serif',
              weight: 'bold',
            },
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
  }
};

onMounted(() => {
  if (props.data.length > 0) {
    createOrUpdateChart();
  }
});

watch(
  () => props.data,
  (newData, oldData) => {
    if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
      createOrUpdateChart();
    }
  },
  { deep: true },
);

watch(treemapCanvas, (newValue) => {
  if (newValue && props.data.length > 0) {
    createOrUpdateChart();
  }
});
</script>

<style lang="scss" scoped>
.treemap-chart {
  height: 100%;
  width: calc(
    100% + 12px
  ); // 12px is the compensation for the  visual padding to the chart

  &__loading {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: $unnnic-spacing-xs;

    height: 100%;

    .loading__skeleton {
      border-radius: $unnnic-border-radius-md;
      height: 100%;
      width: 100%;

      &--1 {
        grid-column: 1 / 5;
        grid-row: 1 / 3;
      }

      &--2 {
        grid-column: 5 / 9;
        grid-row: 1 / 2;
      }

      &--3 {
        grid-column: 5 / 7;
        grid-row: 2 / 3;
      }

      &--4 {
        grid-column: 7 / 8;
        grid-row: 2 / 3;
      }

      &--5 {
        grid-column: 8 / 9;
        grid-row: 2 / 3;
      }
    }
  }

  &__no-data {
    height: 100%;

    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-ant;
    justify-content: center;
    align-items: center;

    .no-data__title {
      font-size: $unnnic-font-size-title-sm;
      font-family: $unnnic-font-family-secondary;
      font-weight: $unnnic-font-weight-bold;
      color: $unnnic-color-neutral-darkest;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    }

    .no-data__description {
      font-size: $unnnic-font-size-body-lg;
      font-family: $unnnic-font-family-secondary;
      color: $unnnic-color-neutral-cloudy;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }
  }

  &__canvas {
    transform: translateX(-6px); // Need to remove visual padding from the chart
  }
}
</style>
