<template>
  <CardBase
    class="card-vtex-order"
    :class="{ 'card-vtex-order--not-data': isError }"
  >
    <header
      v-if="!isError"
      class="card-vtex-order__header"
    >
      <h1 class="header__title">
        {{
          $t(
            widget.name === 'vtex_orders'
              ? 'widgets.vtex_order.title'
              : widget.name,
          )
        }}
      </h1>
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
        icon: this.widget?.config?.[key]?.icon || 'local_activity',
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

  padding: $unnnic-space-6;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $unnnic-space-4;

  :deep(.unnnic-avatar-icon.aux-red-500) {
    background: $unnnic-color-red-2;
  }

  :deep(.material-symbols-rounded.unnnic-icon-scheme--aux-red-500) {
    color: $unnnic-color-red-8;
  }

  &--not-data {
    .card-vtex-order__header .header__title {
      color: $unnnic-color-gray-7;
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
      padding: $unnnic-space-1 0;

      color: $unnnic-color-red-8;
      font-family: $unnnic-font-family;
      font-size: 20px;
      font-weight: $unnnic-font-weight-bold;
      line-height: 4px * 7.5;
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
      row-gap: $unnnic-space-20;
      align-items: center;
    }

    .content__orders {
      display: flex;
      align-items: flex-start;
      gap: $unnnic-space-2;

      &__container-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: $unnnic-space-1;
        flex: 1 0 0;

        &-value {
          color: $unnnic-color-gray-12;
          text-align: right;

          font-family: $unnnic-font-family;
          font-size: 32px;
          font-style: normal;
          font-weight: $unnnic-font-weight-bold;
          line-height: 2.5rem;
        }

        &-text {
          color: $unnnic-color-gray-12;

          font-family: $unnnic-font-family;
          font-size: $unnnic-font-size;
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
        color: $unnnic-color-gray-7;
        font-size: $unnnic-font-size;
        text-align: center;
        line-height: 4px * 6;

        &--bold {
          font-weight: $unnnic-font-weight-bold;
          padding-bottom: $unnnic-space-4;
        }
      }
    }
  }
}
</style>
