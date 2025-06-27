<template>
  <section class="line-human-service-widget">
    <LineChart
      :chartData="currentChartData"
      :isLoading="isLoading"
      :title="title"
      :seeMore="true"
    >
      <template #header>
        <section class="custom-header">
          <section class="custom-header__title-section">
            <h1 class="custom-header__title">{{ title }}</h1>
            <ShortTab
              :tabs="chartTabs"
              :defaultTab="activeChartTab"
              @tab-change="handleChartTabChange"
            />
          </section>
          <section class="custom-header__dicionary">
            <p class="custom-header__dicionary-item">
              <span
                class="custom-header__dicionary-dot custom-header__dicionary-dot-primary"
              />
              {{ $t('widgets.line_human_service.dicionary.total') }}
            </p>
            <p class="custom-header__dicionary-item">
              <span
                class="custom-header__dicionary-dot custom-header__dicionary-dot-secondary"
              />
              {{ $t('widgets.line_human_service.dicionary.human_service') }}
            </p>
          </section>
        </section>
      </template>
    </LineChart>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import LineChart from '@/components/insights/charts/LineChart.vue';
import ShortTab from '@/components/ShortTab.vue';

const isLoading = ref(false);
const title = ref('Atendimento humano by hour');
const activeChartTab = ref(0);

const chartTabs = ref([
  { name: 'Hour', key: 'hour' },
  { name: 'Day', key: 'day' },
  { name: 'Month', key: 'month' },
]);

const geralData = {
  labels: [
    '7h',
    '8h',
    '9h',
    '10h',
    '11h',
    '12h',
    '13h',
    '14h',
    '15h',
    '16h',
    '17h',
    '18h',
  ],
  datasets: [
    { data: [3503, 3430, 1261, 1090, 907, 737, 611, 208, 1566, 350, 720, 840] },
    { data: [500, 1000, 760, 870, 805, 607, 536, 100, 868, 150, 300, 400] },
  ],
};

const detalhadoData = {
  labels: [
    '7h',
    '8h',
    '9h',
    '10h',
    '11h',
    '12h',
    '13h',
    '14h',
    '15h',
    '16h',
    '17h',
    '18h',
  ],
  datasets: [
    { data: [692, 1670, 1261, 1090, 907, 737, 611, 208, 1566, 350, 720, 840] },
    { data: [500, 1000, 760, 870, 805, 607, 536, 100, 868, 150, 300, 400] },
  ],
};

const currentChartData = computed(() => {
  return activeChartTab.value === 0 ? geralData : detalhadoData;
});

const handleChartTabChange = (
  index: number,
  tab: { name: string; key: string },
) => {
  console.log('Chart tab changed:', index, tab);
  activeChartTab.value = index;
};
</script>

<style lang="scss" scoped>
.line-human-service-widget {
  width: 100%;
  height: 100%;
  padding: $unnnic-spacing-md;
  border-radius: $unnnic-border-radius-md;
  background-color: $unnnic-color-neutral-white;
  box-shadow: $unnnic-shadow-level-far;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  :deep(.line-chart) {
    box-shadow: none;
  }
}

.custom-header {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__title-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: $unnnic-spacing-md;
  }

  &__title {
    font-family: $unnnic-font-family-primary;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-gt;
    color: $unnnic-color-neutral-dark;
    margin: 0;
    flex: 1;
  }
}

.custom-header {
  &__title-section {
    align-items: center;
  }

  &__dicionary {
    display: flex;
    gap: $unnnic-spacing-md;

    &-item {
      font-family: $unnnic-font-family-primary;
      font-weight: $unnnic-font-weight-bold;
      font-size: $unnnic-font-size-body-gt;
      color: $unnnic-color-neutral-dark;
      display: flex;
      gap: $unnnic-spacing-xs;
      align-items: center;
    }

    &-dot {
      display: inline-block;
      width: $unnnic-spacing-xs;
      height: $unnnic-spacing-xs;
      border-radius: 50%;

      &-primary {
        background-color: $unnnic-color-aux-orange-500;
      }

      &-secondary {
        background-color: $unnnic-color-aux-blue-500;
      }
    }
  }
}
</style>
