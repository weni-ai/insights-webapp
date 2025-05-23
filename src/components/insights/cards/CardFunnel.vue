<template>
  <CardBase
    class="card-funnel"
    :class="{ 'card-funnel--not-configured': !configured }"
  >
    <header class="card-funnel__header">
      <h1 class="header__title">{{ $t('widgets.graph_funnel.title') }}</h1>
      <UnnnicButton
        v-if="configured && configurable"
        size="small"
        type="tertiary"
        iconCenter="tune"
        data-testid="card-funnel-config-button-configurable"
        @click.stop="$emit('open-config')"
      />
    </header>
    <section class="card-funnel__content">
      <section
        v-if="!configured"
        class="content__not-configured"
      >
        <UnnnicIcon
          size="lg"
          icon="filter_alt"
          scheme="neutral-cloudy"
        />
        <p class="not-configured__text">
          {{ $t('widgets.graph_funnel.not_configured_description') }}
        </p>
        <UnnnicButton
          :text="$t('widgets.graph_funnel.select_flows')"
          type="primary"
          data-testid="card-funnel-config-button-not-configured"
          @click="$emit('open-config')"
        />
      </section>
      <FunnelChart
        v-else
        :chartData="chartData"
        :isLoading="isLoading"
        :hasError="hasError"
        @reload="$emit('request-data')"
      />
    </section>
  </CardBase>
</template>

<script>
import { mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

import CardBase from './CardBase.vue';
import FunnelChart from '../charts/FunnelChart.vue';

export default {
  name: 'CardFunnel',

  components: { CardBase, FunnelChart },

  props: {
    isLoading: Boolean,
    hasError: Boolean,
    configured: Boolean,
    configurable: Boolean,
    widget: {
      type: Object,
      required: true,
    },
    chartData: {
      type: Array,
      required: true,
    },
  },

  emits: ['open-config', 'request-data'],

  computed: {
    ...mapState(useDashboards, ['appliedFilters']),
  },

  watch: {
    appliedFilters: {
      deep: true,
      handler() {
        this.emitRequestData();
      },
    },
  },

  created() {
    this.emitRequestData();
  },

  methods: {
    emitRequestData() {
      this.$emit('request-data');
    },
  },
};
</script>

<style lang="scss" scoped>
.card-funnel {
  min-height: 310px;
  height: 100%;
  width: 100%;

  padding: $unnnic-spacing-md;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $unnnic-spacing-sm;

  &--not-configured {
    .card-funnel__header .header__title {
      color: $unnnic-color-neutral-cloudy;
    }
  }

  &__header {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: $unnnic-spacing-md;

    .header__title {
      padding: $unnnic-spacing-nano 0;

      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-primary;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-line-height-small * 7.5;
    }
  }

  &__content {
    overflow: hidden;
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;

    .content__not-configured {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: $unnnic-spacing-sm;

      .not-configured__text {
        color: $unnnic-color-neutral-cloudy;
        font-size: $unnnic-font-size-body-lg;
        text-align: center;
        line-height: $unnnic-line-height-small * 6;
      }
    }
  }
}
</style>
