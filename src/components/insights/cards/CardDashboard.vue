<template>
  <div class="card-dashboard-container">
    <UnnnicToolTip
      :data-testid="`card-${id}-tooltip`"
      :text="hoverTooltip"
      side="right"
      maxWidth="200px"
      :enabled="!!hoverTooltip"
    >
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

          <section
            v-else
            class="content-metric"
          >
            <section class="content-metric__container">
              <p
                v-if="friendlyEmoji"
                class="content-metric__friendly-id"
                data-testid="card-dashboard-friendly-id"
              >
                {{ friendlyEmoji }}
              </p>
              <IconLoading v-if="isLoading" />
              <h1
                v-else
                class="content-metric__value"
                :title="configured ? metric : '0'"
                data-testid="card-dashboard-metric-value"
              >
                {{ configured ? metric : '0' }}
              </h1>
            </section>
            <UnnnicButton
              v-if="configurable || !configured"
              class="card-dashboard__button-config"
              data-testid="card-dashboard-button-config"
              type="tertiary"
              iconCenter="tune"
              @click.stop="$emit('open-config')"
            />
          </section>
          <section class="content-description">
            <p
              v-if="!showMetricError"
              class="content-description__text"
              data-testid="card-dashboard-content-description"
              :title="
                configured ? $t(description) : $t('widgets.card.metric_empty')
              "
            >
              {{
                configured ? $t(description) : $t('widgets.card.metric_empty')
              }}
            </p>
            <UnnnicToolTip
              v-if="tooltip"
              enabled
              :text="tooltip"
              side="right"
              class="content-description__tooltip"
              data-testid="content-desciption-tooltip"
            >
              <UnnnicIcon
                icon="info"
                size="avatar-nano"
              />
            </UnnnicToolTip>
          </section>
        </section>
      </CardBase>
    </UnnnicToolTip>
  </div>
</template>

<script>
import IconLoading from '@/components/IconLoading.vue';

import CardBase from './CardBase.vue';
import CardTitleError from './CardTitleError.vue';

import { emojis } from '@emoji-mart/data';

export default {
  name: 'CardDashboard',

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
    friendlyId: {
      type: String,
      default: '',
    },
    clickable: Boolean,
    configured: Boolean,
    configurable: Boolean,
    isLoading: Boolean,
    id: {
      type: String,
      default: '',
    },
    hoverTooltip: {
      type: String,
      default: '',
    },
    tooltip: {
      type: String,
      default: '',
    },
  },

  emits: ['open-config'],

  computed: {
    showMetricError() {
      return this.metric === null;
    },
    friendlyEmoji() {
      if (!this.friendlyId) return '';
      const emoji = emojis[this.friendlyId]?.skins?.[0]?.native || '';
      return emoji;
    },
  },
};
</script>

<style scoped lang="scss">
.card-dashboard {
  padding: $unnnic-space-6;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $unnnic-space-2;

  overflow: hidden;

  &-container {
    display: grid;
  }

  &.clickable:not(.loading):hover {
    background-color: $unnnic-color-teal-1;

    cursor: pointer;
  }

  &.not-configured {
    .card__content {
      color: $unnnic-color-gray-7;
    }

    .card-dashboard__button-config {
      align-self: center;
    }
  }

  .card__content {
    width: 100%;
    color: $unnnic-color-gray-12;
    display: grid;
    gap: $unnnic-space-1;

    .content-error {
      font-size: 14px;
      line-height: 8px * 3;
    }
    .content-metric {
      display: flex;
      justify-content: space-between;
      overflow: hidden;
      &__container {
        display: flex;
        align-items: center;
        gap: $unnnic-space-3;
        overflow: hidden;
        white-space: nowrap;
      }
      &__friendly-id {
        font-size: 24px;
        padding-bottom: $unnnic-space-1 * 1.5;
      }
      &__value {
        font-family: $unnnic-font-family;
        font-size: 32px;
        line-height: 16px * 3;
        font-weight: $unnnic-font-weight-bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .content-description {
      display: flex;
      align-items: center;
      gap: $unnnic-space-1;
      flex-wrap: wrap;
      overflow: hidden;
      &__text {
        font-size: $unnnic-font-size;
        line-height: 8px * 3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      &__tooltip {
        margin-top: $unnnic-space-1;
      }
    }
  }

  &__button-config.unnnic-button {
    align-self: start;
    min-width: fit-content;
  }
}
</style>
