<template>
  <section class="multiple-line-chart">
    <section
      v-if="isLoading"
      class="multiple-line-chart__loading"
    >
      <img
        :src="weniLoading"
        width="50"
        height="50"
      />
    </section>

    <template v-else>
      <section class="multiple-line-chart__counts-container">
        <section
          v-for="(groupData, index) in props.data"
          :key="groupData.group"
          class="multiple-line-chart__count"
        >
          <section class="multiple-line-chart__count-label">
            <UnnnicIcon
              class="dot"
              icon="indicator"
              :scheme="Object.keys(colorsMapper)[index]"
            />
            <p data-testid="data-label">{{ $t(groupData.group) }}</p>
          </section>
          <section class="multiple-line-chart__count-total">
            <p class="multiple-line-chart__count-total-value">
              {{ groupData.total }}
            </p>
            <p
              v-if="index !== 0"
              class="multiple-line-chart__count-total-percentage"
            >
              ({{ getPercentageOf(groupData.total, totalItems) }})
            </p>
          </section>
        </section>
      </section>
      <section class="multiple-line-chart__chart">
        <BaseChart
          type="line"
          :data="formattedChartData"
          :options="options"
          :plugins="plugins"
        />
      </section>
    </template>
  </section>
</template>

<script>
export default {
  name: 'MultipleLineChart',
};
</script>

<script setup>
import { computed } from 'vue';
import BaseChart from './BaseChart.vue';
import { Tooltip } from 'chart.js';
import { getPercentageOf } from '@/utils/numbers';
import i18n from '@/utils/plugins/i18n';
import weniLoading from '@/assets/images/weni-loading.svg';
import {
  colorPurple300,
  colorGreen300,
  colorBlue300,
  colorOrange300,
  colorGray300,
  colorGray800,
} from '@weni/unnnic-system/tokens/colors';

const colorsMapper = {
  'aux-purple-300': colorPurple300,
  'aux-green-300': colorGreen300,
  'aux-blue-300': colorBlue300,
  'aux-orange-300': colorOrange300,
};

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const totalItems = computed(() => props.data[0]?.total || 0);

const formattedChartData = computed(() => ({
  labels: props.data[0].data.map(({ label }) => i18n.global.t(label)),
  datasets: props.data.map((mapedData, index) => ({
    label: i18n.global.t(mapedData.group),
    data: mapedData.data.map((item) => item.value),
    fill: false,
    borderColor: Object.values(colorsMapper)[index],
    pointRadius: 0,
    hoverRadius: 3,
    dotColor: Object.values(colorsMapper)[index],
  })),
}));

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  scales: {
    y: {
      beginAtZero: true,
      suggestedMin: 0,
      display: true,
      ticks: {
        color: colorGray300,
      },
    },
    x: {
      ticks: {
        padding: -1,
        color: colorGray300,
      },
      grid: {
        display: true,
      },
    },
  },
  plugins: {
    tooltip: {
      enabled: true,
      backgroundColor: colorGray800,
      displayColors: false,
      font: {
        size: '16',
        weight: '700',
      },
    },
    datalabels: {
      display: false,
    },
  },
}));

const plugins = computed(() => [Tooltip]);
</script>

<style lang="scss" scoped>
.multiple-line-chart {
  display: flex;
  flex-direction: column;
  padding: $unnnic-spacing-md;
  border-radius: $unnnic-border-radius-sm;
  border: 1px solid $unnnic-color-neutral-soft;
  gap: $unnnic-spacing-sm;
  width: 100%;
  min-height: 280px;

  &__loading {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__counts-container {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
  &__count {
    display: flex;
    flex-direction: column;
    margin-right: auto;

    &-label {
      display: flex;
      align-items: center;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-lg;
      color: $unnnic-color-neutral-dark;
      line-height: $unnnic-line-height-large + $unnnic-line-height-medium;
    }
    &-total {
      display: flex;
      margin-left: $unnnic-spacing-ant;
      margin-top: $unnnic-spacing-xs;
      gap: $unnnic-spacing-xs;
      align-items: flex-end;
      &-value {
        font-family: $unnnic-font-family-primary;
        font-size: $unnnic-font-size-title-md;
        color: $unnnic-color-neutral-dark;
        font-style: normal;
        font-weight: $unnnic-font-weight-bold;
        line-height: $unnnic-line-height-large * 2;
      }
      &-percentage {
        font-family: $unnnic-font-family-primary;
        font-size: $unnnic-font-size-body-lg;
        color: $unnnic-color-neutral-cloudy;
        font-style: normal;
        line-height: $unnnic-line-height-large + $unnnic-line-height-medium;
      }
    }
  }
}
</style>
