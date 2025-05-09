<template>
  <CardBase
    class="card-vtex-order"
    :class="{ 'card-vtex-order--not-data': isError }"
  >
    <header
      v-if="!isError"
      class="card-vtex-order__header"
    >
      <h1 class="header__title">{{ $t('widgets.vtex_order.title') }}</h1>
      <UnnnicButton
        size="small"
        type="tertiary"
        iconCenter="tune"
        data-testid="card-vtex-order-config-button-configurable"
        @click.stop="$emit('open-config')"
      />
    </header>
    <section class="card-vtex-order__content">
      <section
        v-if="isError && !isLoading"
        class="content__not-configured"
      >
        <img src="@/assets/images/icons/empty_cloud.svg" />
        <p class="not-configured__text">
          {{ $t('widgets.vtex_order.empty_data.title') }}
        </p>
        <p class="not-configured__text not-configured__text--bold">
          {{ $t('widgets.vtex_order.empty_data.sub_title') }}
        </p>
        <UnnnicButton
          :text="$t('widgets.vtex_order.empty_data.verify_btn')"
          type="primary"
          size="small"
          data-testid="card-vtex-order-config-button-not-configured"
          @click="$emit('open-config')"
        />
      </section>
      <section
        v-else
        class="content__orders__container"
      >
        <IconLoading
          v-if="isLoading"
          class="card-vtex-order-margin-auto"
        />
        <section
          v-for="(list, index) in dataList"
          v-show="!isLoading"
          :key="index"
          class="content__orders"
        >
          <UnnnicAvatarIcon
            :icon="list.icon"
            scheme="aux-red-500"
            size="sm"
          />
          <section class="content__orders__container-item">
            <p class="content__orders__container-item-value">
              {{ list.value }}
            </p>
            <p class="content__orders__container-item-text">{{ list.label }}</p>
          </section>
        </section>
      </section>
    </section>
  </CardBase>
</template>

<script>
import { mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

import CardBase from './CardBase.vue';
import IconLoading from '@/components/IconLoading.vue';

import i18n from '@/utils/plugins/i18n';

export default {
  name: 'CardVtexOrder',

  components: { CardBase, IconLoading },

  props: {
    isLoading: Boolean,
    data: {
      type: Object,
      required: true,
    },
    widget: {
      type: Object,
      required: true,
    },
  },

  emits: ['open-config', 'request-data'],

  computed: {
    ...mapState(useDashboards, ['appliedFilters']),
    isError() {
      const allEmpty = Object?.values(this.data || {}).every(
        (str) => str === '',
      );
      return allEmpty;
    },

    dataList() {
      if (this.isError || !this.data) return [];

      const keyValues = Object.keys(this.data);

      return keyValues.map((key) => ({
        label: i18n.global.t(`widgets.vtex_order.${key}`),
        icon: this.widget.config[key].icon || 'local_activity',
        value: this.data[key] || '',
      }));
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
    emitRequestData() {
      this.$emit('request-data');
    },
  },
};
</script>

<style lang="scss" scoped>
.card-vtex-order {
  min-height: 310px;
  height: 100%;

  padding: $unnnic-spacing-md;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $unnnic-spacing-sm;

  :deep(.unnnic-avatar-icon.aux-red-500) {
    background: #fff3f6;
  }

  :deep(.material-symbols-rounded.unnnic-icon-scheme--aux-red-500) {
    color: rgba(247, 25, 99, 1);
  }

  &--not-data {
    .card-vtex-order__header .header__title {
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

      color: #f71963;
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

    .content__orders__container {
      height: 100%;
      width: 100%;
      display: grid;
      row-gap: $unnnic-spacing-awesome;
      align-items: center;
    }

    .content__orders {
      display: flex;
      align-items: flex-start;
      gap: $unnnic-spacing-xs;

      &__container-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: $unnnic-spacing-nano;
        flex: 1 0 0;

        &-value {
          color: $unnnic-color-neutral-darkest;
          text-align: right;

          font-family: $unnnic-font-family-primary;
          font-size: $unnnic-font-size-title-lg;
          font-style: normal;
          font-weight: $unnnic-font-weight-bold;
          line-height: 2.5rem;
        }

        &-text {
          color: $unnnic-color-neutral-darkest;

          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-lg;
          font-style: normal;
          font-weight: $unnnic-font-weight-regular;
          line-height: 1.5rem;
        }
      }
    }

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

        &--bold {
          font-weight: $unnnic-font-weight-bold;
          padding-bottom: $unnnic-spacing-sm;
        }
      }
    }
  }
}
</style>
