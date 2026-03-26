<template>
  <CardBase class="vtex-conversions-widget">
    <section
      v-if="isLoadingData"
      class="vtex-conversions-widget__loading"
      data-testid="vtex-conversions-loading"
    >
      <UnnnicIconLoading />
    </section>
    <section
      v-else-if="!isLoadingData && hasError"
      class="vtex-conversions-widget__error"
      data-testid="vtex-conversions-error"
    >
      <img src="@/assets/images/icons/empty_cloud.svg" />

      <p class="vtex-conversions-widget__error-title">
        {{ $t('widgets.vtex_order.empty_data.title') }}
      </p>

      <p class="vtex-conversions-widget__error-description">
        {{ $t('widgets.vtex_order.empty_data.sub_title') }}
      </p>
      <UnnnicButton
        :text="$t('widgets.vtex_order.empty_data.verify_btn')"
        type="primary"
        size="small"
        data-testid="empty-data-verify-button"
        @click="$emit('open-config')"
      />
    </section>
    <template v-else>
      <section class="vtex-conversions-widget__header">
        <h1
          class="vtex-conversions-widget__title"
          data-testid="vtex-conversions-title"
        >
          {{ props.widget?.name }}
        </h1>
        <UnnnicButton
          size="small"
          type="tertiary"
          iconCenter="tune"
          data-testid="open-config-button"
          @click.stop="$emit('open-config')"
        />
      </section>
      <section class="vtex-conversions-widget__vtex-container">
        <section class="vtex-conversions-widget__vtex-data">
          <h2 class="vtex-conversions-widget__vtex-data-value">
            {{ vtexData?.count_sell }}
          </h2>
          <p class="vtex-conversions-widget__vtex-data-label">
            {{ $t('widgets.vtex_conversions.label.orders') }}
          </p>
        </section>
        <hr class="vtex-conversions-widget__vtex-data-divider" />
        <section class="vtex-conversions-widget__vtex-data">
          <h2 class="vtex-conversions-widget__vtex-data-value">
            {{ vtexData?.accumulated_total }}
          </h2>
          <p class="vtex-conversions-widget__vtex-data-label">
            {{ $t('widgets.vtex_conversions.label.total_value') }}
          </p>
        </section>
        <hr class="vtex-conversions-widget__vtex-data-divider" />
        <section class="vtex-conversions-widget__vtex-data">
          <h2 class="vtex-conversions-widget__vtex-data-value">
            {{ vtexData?.medium_ticket }}
          </h2>
          <p class="vtex-conversions-widget__vtex-data-label">
            {{ $t('widgets.vtex_conversions.label.average_ticket') }}
          </p>
        </section>
      </section>
      <section class="vtex-conversions-widget__meta-container">
        <UnnnicChartFunnel
          class="vtex-conversions-widget__meta-graph"
          data-testid="vtex-conversions-meta-graph"
          :data="metaData"
        />
      </section>
    </template>
  </CardBase>
</template>

<script setup>
import { computed } from 'vue';

import CardBase from './CardBase.vue';

import i18n from '@/utils/plugins/i18n';
import { formatPercentage, formatValue } from '@/utils/numbers';
import {
  colorPurple4,
  colorGreen4,
  colorBlue5,
  colorOrange4,
  colorRed10,
} from '@weni/unnnic-system/tokens/colors';

const props = defineProps({
  widget: {
    type: Object,
    required: true,
  },
  data: {
    type: Object,
    default: () => ({}),
  },
  isLoadingData: {
    type: Boolean,
    default: false,
  },
});

const hasError = computed(() => props.data.error);

const vtexData = computed(() => {
  return props.data?.utm_data || {};
});

const metaData = computed(() => {
  const graphData = props.data?.graph_data;
  if (!graphData) return [];
  const keysOrdend = ['sent', 'delivered', 'read', 'clicked', 'orders'];
  const colors = [
    colorPurple4,
    colorGreen4,
    colorBlue5,
    colorOrange4,
    colorRed10,
  ];
  return keysOrdend.map((key, index) => ({
    title:
      key === 'sent'
        ? formatPercentage(100, i18n.global.locale)
        : formatPercentage(graphData[key]?.percentage, i18n.global.locale),
    description: i18n.global.t(`widgets.vtex_conversions.label.${key}`),
    value: formatValue(graphData[key]?.value, i18n.global.locale),
    color: colors[index],
  }));
});

defineEmits(['open-config']);
</script>

<style lang="scss" scoped>
.vtex-conversions-widget {
  display: flex;
  flex-direction: column;
  padding: $unnnic-space-6;
  gap: $unnnic-space-6;

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__title {
    color: $unnnic-color-gray-12;
    font: $unnnic-font-display-3;
  }

  &__vtex {
    &-container {
      display: flex;
      align-items: flex-start;
      gap: $unnnic-space-6;
      align-self: stretch;
    }
    &-data {
      display: flex;
      flex-direction: column;
      width: 100%;
      &-value {
        color: $unnnic-color-gray-12;
        font: $unnnic-font-display-3;
      }
      &-label {
        color: $unnnic-color-fg-muted;
        font: $unnnic-font-caption-2;
      }
      &-divider {
        background: $unnnic-color-gray-1;
        height: 100%;
        border: 1px solid $unnnic-color-gray-1;
      }
    }
  }

  &__meta {
    &-container {
      display: flex;
      flex: 1;
    }
    &-graph {
      :deep(.unnnic-chart-funnel-base-item__card) {
        position: relative;
        z-index: 2;
      }
      :deep(.unnnic-chart-funnel-base-item:not(:last-child)) {
        position: relative;
        &::after {
          z-index: 1;
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: calc(100%);
          border-bottom: 1px solid $unnnic-color-gray-2;
        }
      }
    }
  }

  &__error {
    height: 100%;
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
}
</style>
