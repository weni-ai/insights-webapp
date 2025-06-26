<template>
  <section
    class="native-bar-chart__container"
    :class="{ 'native-bar-chart__container-isLoading': isLoading }"
  >
    <IconLoading
      v-if="isLoading"
      class="native-bar-chart__container-icon-loading"
      data-testid="icon-loading"
    />
    <section
      v-if="!isLoading"
      class="native-bar-chart__chart-area"
      data-testid="native-bar-chart-area"
    >
      <section class="native-bar-chart__bars-container">
        <section
          v-for="(item, index) in chartData"
          :key="index"
          class="native-bar-chart__bar-group"
          data-testid="native-bar-chart-bar-group"
          @click.stop="item && emitClickData(item)"
        >
          <section
            v-if="item"
            class="native-bar-chart__bar-wrapper"
          >
            <section class="native-bar-chart__bar-value">
              {{ formatValue(item.value) }}
            </section>
            <section
              class="native-bar-chart__bar"
              :style="{
                height: `${item.percentage}%`,
                backgroundColor: getBarColor(),
              }"
            />
            <section class="native-bar-chart__bar-label">
              {{ item.label }}
            </section>
          </section>
        </section>
      </section>
    </section>
    <section class="native-bar-chart__more-link-container">
      <a
        v-if="seeMore && !isLoading"
        href=""
        data-testid="see-more-link"
        class="native-bar-chart__more-link"
        @click.prevent.stop="$emit('seeMore')"
      >
        {{ $t('widgets.see_more') }}
      </a>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import IconLoading from '@/components/IconLoading.vue';

interface DataItem {
  label: string;
  value: number;
}

interface Props {
  isLoading?: boolean;
  data: DataItem[];
  maxBars?: number;
  color?: string;
  showPercentage?: boolean;
  seeMore?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  maxBars: 6,
  color: () => '#B794F4',
  showPercentage: false,
  seeMore: false,
});

const emit = defineEmits<{
  clickData: [data: { label: string; data: number }];
  seeMore: [];
}>();

const chartData = computed(() => {
  const filteredData = props.data.slice(0, props.maxBars);
  const maxValue = Math.max(...filteredData.map((item) => item.value));

  return filteredData.map((item) => ({
    ...item,
    percentage: maxValue > 0 ? (item.value / maxValue) * 100 : 0,
  }));
});

const getBarColor = (): string => {
  return props.color;
};

const formatValue = (value: number): string => {
  if (props.showPercentage) {
    return `${value.toFixed(1)}%`;
  }
  return value.toLocaleString();
};

const emitClickData = (data: DataItem) => {
  emit('clickData', { label: data.label, data: data.value });
};
</script>

<style lang="scss" scoped>
.native-bar-chart {
  &__more-link {
    color: $unnnic-color-neutral-dark;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  &__more-link-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__container {
    height: 100%;
    background-color: $unnnic-color-neutral-white;
    padding: $unnnic-spacing-md;
    border-radius: $unnnic-border-radius-sm;

    &-isLoading {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &-icon-loading {
      color: $unnnic-color-weni-600;
    }
  }

  &__chart-area {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &__bars-container {
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: $unnnic-spacing-nano;
    padding: $unnnic-spacing-sm 0;
    min-height: 200px;

    @media screen and (max-width: 1024px) {
      min-height: 150px;
      gap: $unnnic-spacing-nano;
    }

    @media screen and (max-width: 768px) {
      min-height: 120px;
    }
  }

  &__bar-group {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  &__bar-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    width: 100%;

    @media screen and (max-width: 1024px) {
      max-width: 45px;
    }

    @media screen and (max-width: 768px) {
      max-width: 35px;
    }
  }

  &__bar-value {
    margin-bottom: $unnnic-spacing-xs;
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    text-align: center;
    min-height: 20px;

    @media screen and (max-width: 768px) {
      font-size: $unnnic-font-size-body-lg;
    }
  }

  &__bar {
    width: 100%;
    min-height: 4px;
    border-radius: $unnnic-spacing-nano;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
      opacity: 0.8;
    }
  }

  &__bar-label {
    margin-top: $unnnic-spacing-xs;
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-regular;
    text-align: center;
    max-width: 100%;
    word-wrap: break-word;
    hyphens: auto;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

    @media screen and (max-width: 1024px) {
      font-size: $unnnic-font-size-body-md;
    }

    @media screen and (max-width: 768px) {
      font-size: $unnnic-font-size-body-sm;
    }
  }
}
</style>
