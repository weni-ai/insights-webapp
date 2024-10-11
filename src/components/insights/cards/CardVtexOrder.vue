<template>
  <CardBase
    class="card-vtex-order"
    :class="{ 'card-vtex-order--not-data': configured }"
  >
    <header
      v-if="!configured && configurable"
      class="card-vtex-order__header"
    >
      <h1 class="header__title">{{ $t('widgets.vtex_order.title') }}</h1>
      <UnnnicButton
        size="small"
        type="secondary"
        iconCenter="tune"
        data-testid="card-vtex-order-config-button-configurable"
        @click.stop="$emit('open-config')"
      />
    </header>
    <section class="card-vtex-order__content">
      <section
        v-if="configured"
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
        <section class="content__orders">
          <UnnnicAvatarIcon
            icon="local_activity"
            scheme="aux-red-500"
            size="sm"
          />
          <section class="content__orders__container-item">
            <p class="content__orders__container-item-value">30</p>
            <p class="content__orders__container-item-text">Pedidos</p>
          </section>
        </section>
        <section class="content__orders">
          <UnnnicAvatarIcon
            icon="local_activity"
            scheme="aux-red-500"
            size="sm"
          />
          <section class="content__orders__container-item">
            <p class="content__orders__container-item-value">30</p>
            <p class="content__orders__container-item-text">Pedidos</p>
          </section>
        </section>
        <section class="content__orders">
          <UnnnicAvatarIcon
            icon="local_activity"
            scheme="aux-red-500"
            size="sm"
          />
          <section class="content__orders__container-item">
            <p class="content__orders__container-item-value">30</p>
            <p class="content__orders__container-item-text">Pedidos</p>
          </section>
        </section>
      </section>
    </section>
  </CardBase>
</template>

<script>
import CardBase from './CardBase.vue';

export default {
  name: 'CardVtexOrder',

  components: { CardBase },

  props: {
    isLoading: Boolean,
    configured: Boolean,
    configurable: Boolean,
    widget: {
      type: Object,
      required: true,
    },
  },

  emits: ['open-config'],
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
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: $unnnic-spacing-awesome 0;
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

          font-family: $unnnic-font-family-primary;
          font-size: $unnnic-font-size-title-md;
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
