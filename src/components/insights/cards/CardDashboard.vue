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
          {{ $t('widgets.card.error_description') }}
        </p>
      </template>

      <IconLoading v-else-if="isLoading" />

      <h1
        v-else
        class="content-metric"
        :title="configured ? metric : '0'"
      >
        {{ configured ? metric : '0' }}
      </h1>
      <p
        v-if="!showMetricError"
        class="content-description"
        :title="configured ? description : $t('widgets.card.metric_empty')"
      >
        {{ configured ? description : $t('widgets.card.metric_empty') }}
      </p>
    </section>
    <UnnnicButton
      v-if="configurable || !configured"
      class="card-dashboard__button-config"
      type="secondary"
      :iconCenter="configured ? 'tune' : ''"
      :iconLeft="configured ? '' : 'tune'"
      :text="configured ? '' : $t('widgets.card.metric_set')"
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

  components: {
    CardBase,
    IconLoading,
    CardTitleError,
  },

  props: {
    metric: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    clickable: Boolean,
    configured: Boolean,
    configurable: Boolean,
    isLoading: Boolean,
  },

  emits: ['open-config'],

  computed: {
    showMetricError() {
      return this.metric === null;
    },
  },
};
</script>

<style scoped lang="scss">
.card-dashboard {
  padding: $unnnic-spacing-md;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $unnnic-spacing-xs;

  max-height: min-content;
  overflow: hidden;

  &.clickable:not(.loading):hover {
    background-color: $unnnic-color-weni-50;

    cursor: pointer;
  }

  &.not-configured {
    .card__content {
      color: $unnnic-color-neutral-cloudy;
    }

    .card-dashboard__button-config {
      align-self: center;
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
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .content-description {
      font-size: $unnnic-font-size-body-lg;
      line-height: $unnnic-line-height-medium * 3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__button-config.unnnic-button {
    align-self: start;
    min-width: fit-content;
  }
}
</style>
