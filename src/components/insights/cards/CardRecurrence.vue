<template>
  <CardBase
    class="card-recurrence"
    :class="{ 'card-recurrence--not-data': isError }"
  >
    <header class="card-recurrence__header">
      <h1 class="header__title">
        {{ widget?.name }}
      </h1>
      <UnnnicButton
        size="small"
        type="tertiary"
        iconCenter="tune"
        data-testid="card-recurrence-config-button-configurable"
        @click.stop="$emit('open-config')"
      />
    </header>
    <section class="card-recurrence__content">
      <section
        v-if="isError && !isLoading"
        class="content__not-configured"
      >
        <img src="@/assets/images/icons/empty_monitory.svg" />
        <p class="not-configured__text">
          {{ $t('widgets.recurrence.empty_data.title') }}
        </p>
        <p class="not-configured__text">
          {{ $t('widgets.recurrence.empty_data.sub_title') }}
        </p>
      </section>
      <ProgressChart
        v-else
        :isLoading="isLoading"
        :data="data"
        @click-data="emitClickData"
      />
    </section>
    <a
      v-if="seeMore && !isLoading"
      class="card-recurrence__link"
      href=""
      data-testid="see-more-link"
      @click.prevent.stop="$emit('seeMore')"
    >
      {{ $t('widgets.recurrence.see_more') }}
    </a>
  </CardBase>
</template>

<script>
import { mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

import CardBase from './CardBase.vue';
import ProgressChart from '@/components/insights/charts/ProgressChart.vue';

export default {
  name: 'CardRecurrence',

  components: { CardBase, ProgressChart },

  props: {
    isLoading: Boolean,
    data: {
      type: Array,
      required: true,
    },
    widget: {
      type: Object,
      required: true,
    },
    seeMore: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['open-config', 'request-data', 'seeMore', 'clickData'],

  computed: {
    ...mapState(useDashboards, ['appliedFilters']),
    isError() {
      return this.data?.length === 0;
    },
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
    emitClickData(data) {
      this.$emit('clickData', data);
    },
    emitRequestData() {
      this.$emit('request-data');
    },
  },
};
</script>

<style lang="scss" scoped>
.divider {
  margin-top: $unnnic-spacing-md;
  height: 1px;
  background-color: $unnnic-color-neutral-light;
  width: 100%;
}

.card-recurrence {
  min-height: 310px;
  height: 100%;

  padding: $unnnic-spacing-md;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $unnnic-spacing-sm;

  &__link {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-sm * 3;
    text-decoration-line: underline;
    text-decoration-style: solid;
    text-decoration-skip-ink: none;
    text-decoration-thickness: auto;
    text-underline-offset: auto;
    text-underline-position: from-font;
  }

  &--not-data {
    .card-recurrence__header .header__title {
      color: $unnnic-color-neutral-cloudy;
    }
  }

  &-margin-auto {
    margin: auto;
  }

  &__header {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    .header__title {
      padding: $unnnic-spacing-nano 0;

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
