<template>
  <CardBase class="vtex-conversions-widget">
    <section
      v-if="isLoadingData"
      class="vtex-conversions-widget__loading"
    >
      <UnnnicIconLoading />
    </section>
    <section
      v-else-if="!isLoadingData && hasError"
      class="vtex-conversions-widget__error"
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
        @click="$emit('open-config')"
      />
    </section>
    <template v-else>
      <section class="vtex-conversions-widget__header">
        <h1 class="vtex-conversions-widget__title">{{ props.widget?.name }}</h1>
        <UnnnicButton
          size="small"
          type="tertiary"
          iconCenter="tune"
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
  const colors = ['#B794F4', '#68D391', '#63B3ED', '#F6AD55', '#F71963'];
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
  padding: $unnnic-spacing-md;
  gap: $unnnic-spacing-md;

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
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-primary;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-medium;
  }

  &__vtex {
    &-container {
      display: flex;
      align-items: flex-start;
      gap: $unnnic-spacing-md;
      align-self: stretch;
    }
    &-data {
      display: flex;
      flex-direction: column;
      width: 100%;
      &-value {
        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-primary;
        font-size: $unnnic-font-size-body-lg;
        font-style: normal;
        font-weight: $unnnic-font-weight-bold;
        line-height: $unnnic-font-size-body-lg + $unnnic-line-height-medium;
      }
      &-label {
        color: $unnnic-color-neutral-cloudy;

        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-md;
        line-height: $unnnic-font-size-body-md + $unnnic-line-height-medium;
      }
      &-divider {
        background: $unnnic-color-neutral-light;
        height: 100%;
        border: 1px solid $unnnic-color-neutral-light;
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
          border-bottom: 1px solid $unnnic-color-neutral-soft;
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

    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-lg;
    text-align: center;
    line-height: $unnnic-line-height-small * 6;

    &-description {
      font-weight: $unnnic-font-weight-bold;
      padding-bottom: $unnnic-spacing-sm;
    }
  }
}
</style>
