<template>
  <section
    :class="[
      'funnel-chart',
      formattedChartData.length === 3
        ? 'funnel-chart-three'
        : 'funnel-chart-default',
    ]"
  >
    <IconLoading
      v-if="isLoading"
      class="funnel-chart__loading"
    />
    <section
      v-else-if="!isLoading && hasError"
      class="funnel-chart__error"
    >
      <img src="@/assets/images/icons/empty_cloud.svg" />

      <p class="funnel-chart__error-title">
        {{ $t('widgets.graph_funnel.error.title') }}
      </p>

      <p class="funnel-chart__error-description">
        {{ $t('widgets.graph_funnel.error.description') }}
      </p>

      <UnnnicButton
        :text="$t('reload')"
        type="primary"
        size="small"
        @click="$emit('reload')"
      />
    </section>
    <UnnnicChartFunnel
      v-else
      :data="formattedChartData"
      type="default"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import IconLoading from '@/components/IconLoading.vue';
import {
  colorBgYellowPlain,
  colorBgOrangePlain,
  colorBgPurplePlain,
  colorBgBluePlain,
  colorBgGreenPlain,
} from '@weni/unnnic-system/tokens/colors';

defineOptions({ name: 'FunnelChart' });

interface FunnelChartItem {
  description?: string;
  percentage?: string | number;
  total?: number;
}

interface FunnelChartProps {
  isLoading?: boolean;
  hasError?: boolean;
  chartData: FunnelChartItem[];
}

const props = withDefaults(defineProps<FunnelChartProps>(), {
  isLoading: false,
  hasError: false,
});

defineEmits<{
  reload: [];
}>();

const { locale } = useI18n();

const formattedChartData = computed(() => {
  const arrayColors = [
    colorBgYellowPlain,
    colorBgOrangePlain,
    colorBgPurplePlain,
    colorBgBluePlain,
    colorBgGreenPlain,
  ];

  if (!Array.isArray(props.chartData)) return [];

  return props.chartData.map((item, index) => {
    return {
      description: item.description,
      title: `${parseFloat(String(item.percentage)).toLocaleString(
        locale.value || 'en-US',
        {
          minimumFractionDigits: 2,
        },
      )}%`,
      value: `${Number(item.total).toLocaleString(locale.value || 'en-US')}`,
      color: arrayColors[index],
    };
  });
});
</script>

<style lang="scss" scoped>
.funnel-chart {
  height: 100%;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  &__loading {
    margin: auto;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    color: $unnnic-color-fg-muted;
    font: $unnnic-font-display-4;
    text-align: center;

    &-description {
      font-weight: $unnnic-font-weight-bold;
      padding-bottom: $unnnic-space-4;
    }
  }

  :deep(.unnnic-chart-funnel-base-item) {
    position: relative;
    z-index: 2;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -1px;
      width: 100%;
      height: 1px;
      background-color: $unnnic-color-gray-2;
      z-index: 1;
    }

    &:last-of-type::after {
      display: none;
    }
  }

  :deep(.overflow-hidden:after) {
    height: 0px;
  }

  :deep(.unnnic-chart-funnel-base-item__text:after) {
    height: 0px;
  }
}

.funnel-chart-three {
  height: 85%;
  :deep(.unnnic-chart-funnel-base-item) {
    .w-60 {
      width: 60%;
    }

    .w-50 {
      width: 47%;
    }

    .w-40 {
      width: 34%;
    }
  }

  @media screen and (max-width: 1024px) {
    :deep(.unnnic-chart-funnel-base-item) {
      .w-60 {
        width: 60%;
      }

      .w-50 {
        width: 35%;
      }

      .w-40 {
        width: 19%;
      }
    }
  }
}

.funnel-chart-default {
  @media screen and (max-width: 1024px) {
    :deep(.unnnic-chart-funnel-base-item) {
      .w-60 {
        width: 60%;
      }

      .w-50 {
        width: 42%;
      }

      .w-40 {
        width: 31%;
      }

      .w-30 {
        width: 21%;
      }

      .w-20 {
        width: 11%;
      }
    }
  }
}
</style>
