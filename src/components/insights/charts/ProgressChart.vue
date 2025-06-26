<template>
  <section
    class="progress-chart__container"
    :class="{ 'progress-chart__container-isLoading': isLoading }"
  >
    <IconLoading
      v-if="isLoading"
      class="progress-chart__container-icon-loading"
      data-testid="icon-loading"
    />
    <template
      v-for="(item, index) in rowData"
      :key="index"
    >
      <section
        v-if="!isLoading"
        class="progress-chart__container-group"
        data-testid="progress-chart-container-group"
        @click.stop="item && emitClickData(item)"
      >
        <template v-if="item">
          <section class="progress-chart__content">
            <section class="progress-chart__container-item">
              <p class="progress-chart__container-item-text">
                {{ item.label }}
              </p>
            </section>
            <section class="progress-bar-container">
              <UnnnicProgressBar
                v-model="item.value"
                class="progress-bar"
                inline
              />
            </section>
          </section>
        </template>
      </section>
    </template>
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
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits<{
  clickData: [data: { label: string; data: number }];
}>();

const rowData = computed(() => {
  return Array(5)
    .fill(null)
    .map((_, index) => props.data[index] || null);
});

const emitClickData = (data: DataItem) => {
  emit('clickData', { label: data.label, data: data.value });
};
</script>

<style lang="scss" scoped>
.progress-chart {
  &__container {
    height: 100%;
    display: grid;
    grid-template-rows: repeat(5, 1fr);
    gap: $unnnic-spacing-sm;
    background-color: $unnnic-color-neutral-white;
    padding: $unnnic-spacing-sm;

    &-group {
      cursor: pointer;
      min-height: $unnnic-avatar-size-sm;
      display: flex;
      flex-direction: column;
      justify-content: center;

      &:empty {
        border-radius: $unnnic-border-radius-sm;
      }

      &:not(:last-child) {
        border-bottom: 1px solid $unnnic-color-neutral-light;
        padding-bottom: $unnnic-spacing-sm;
      }
    }

    &-isLoading {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &-item {
      max-width: 150px;

      @media screen and (max-width: 1440px) {
        max-width: 100px;
      }

      @media screen and (max-width: 1024px) {
        max-width: 80px;
      }

      overflow: hidden;

      &-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        display: inline-block;

        color: $unnnic-color-neutral-cloudy;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-lg;
        font-style: normal;
        font-weight: $unnnic-font-weight-regular;
        line-height: $unnnic-font-size-body-sm * 3;
      }
    }
  }

  &__content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.progress-bar-container {
  :deep(.unnnic-progress-bar.primary) {
    background-color: inherit;
    box-shadow: none;
  }

  @media screen and (max-width: 1024px) {
    :deep(
      .unnnic-progress-bar.primary .progress-bar-container .progress-container
    ) {
      min-width: 100px;
    }
  }

  :deep(
    .unnnic-progress-bar.primary
      .progress-bar-container
      .progress-container
      .bar
  ) {
    border-radius: 37.5rem;
    background-color: $unnnic-color-weni-600;
  }

  :deep(
    .unnnic-progress-bar.primary .progress-bar-container .progress-container
  ) {
    background-color: $unnnic-color-weni-100;
  }

  :deep(.unnnic-progress-bar.primary .progress-bar-container .percentage) {
    font-size: $unnnic-font-size-body-lg;
    line-height: $unnnic-font-size-body-lg * 2;
    min-width: $unnnic-spacing-lg;
  }
}
</style>
