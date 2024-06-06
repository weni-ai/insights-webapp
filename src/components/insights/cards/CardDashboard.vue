<template>
  <CardBase
    class="card-dashboard"
    :class="{
      loading: isLoading,
      'not-configured': !configured,
      clickable,
    }"
  >
    <section class="card__content">
      <template v-if="showMetricError">
        <CardTitleError />
        <p class="content__error">
          Configure novamente o fluxo de origem para obter dados válidos
        </p>
      </template>

      <IconLoading v-else-if="isLoading" />

      <h1
        v-else
        class="content-metric"
      >
        {{ configured ? metric : '0' }}
      </h1>
      <p
        class="content-description"
        v-if="!showMetricError"
      >
        {{ configured ? description : 'Métrica vazia' }}
      </p>
    </section>
    <UnnnicButton
      v-if="configurable || !configured"
      type="secondary"
      :iconCenter="configured ? 'tune' : ''"
      :iconLeft="configured ? '' : 'tune'"
      :text="configured ? '' : 'Definir métrica'"
      @click.stop="$emit('open-config')"
    />
  </CardBase>
</template>

<script>
import IconLoading from '@/components/IconLoading.vue';

import CardBase from './CardBase.vue';
import CardTitleError from './CardTitleError.vue';

export default {
  name: 'DashboardCard',

  props: {
    metric: String,
    description: String,
    clickable: Boolean,
    configured: Boolean,
    configurable: Boolean,
    isLoading: Boolean,
  },

  components: {
    CardBase,
    IconLoading,
    CardTitleError,
  },

  computed: {
    showMetricError() {
      return this.metric === null;
    },
  },
};
</script>

<style scoped lang="scss">
.card-dashboard {
  display: grid;
  grid-template-columns: 1fr auto;

  padding: $unnnic-spacing-md;

  max-height: min-content;

  &.clickable:not(.loading):hover {
    background-color: $unnnic-color-weni-50;

    cursor: pointer;
  }

  &.not-configured {
    align-items: center;

    .card__content {
      color: $unnnic-color-neutral-cloudy;
    }
  }

  .card__content {
    color: $unnnic-color-neutral-darkest;
    display: grid;
    gap: $unnnic-spacing-nano;

    .content-error {
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-line-height-medium * 3;
    }
    .content-metric {
      font-family: $unnnic-font-family-primary;
      font-size: $unnnic-font-size-title-lg;
      line-height: $unnnic-line-height-large * 3;
      font-weight: $unnnic-font-weight-bold;
    }
    .content-description {
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-line-height-medium * 3;
    }
  }
}
</style>
