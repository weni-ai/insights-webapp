<template>
  <CardBase
    class="card-funnel"
    :class="{ 'card-funnel--not-configured': !configured }"
  >
    <header class="card-funnel__header">
      <h1 class="header__title">Funil</h1>
      <UnnnicButton
        v-if="configured"
        size="small"
        type="secondary"
        iconCenter="tune"
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
          Selecione os fluxos que deseja mapear para montar a visualização em
          funil do seu projeto!
        </p>
        <UnnnicButton
          text="Selecionar fluxos"
          type="primary"
          @click="$emit('open-config')"
        />
      </section>
      <FunnelChart
        v-else
        :chartData="chartData"
        :isLoading="isLoading"
      />
    </section>
  </CardBase>
</template>

<script>
import CardBase from './CardBase.vue';
import FunnelChart from '../charts/FunnelChart.vue';

export default {
  name: 'CardFunnel',

  emits: ['open-config'],

  components: { CardBase, FunnelChart },

  props: {
    isLoading: Boolean,
    configured: Boolean,
    chartData: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.card-funnel {
  min-height: 310px;
  height: 100%;

  padding: $unnnic-spacing-sm;

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
