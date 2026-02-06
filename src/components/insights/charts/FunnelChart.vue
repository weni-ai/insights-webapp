<template>
  <section
    :class="[
      'funnel-chart',
      formattedChartData.length === 3
        ? 'funnel-chart-three'
        : 'funnel-chart-default',
    ]"
  >
    <IconLoading
      v-if="isLoading"
      class="funnel-chart__loading"
    />
    <section
      v-else-if="!isLoading && hasError"
      class="funnel-chart__error"
    >
      <img src="@/assets/images/icons/empty_cloud.svg" />

      <p class="funnel-chart__error-title">
        {{ $t('widgets.graph_funnel.error.title') }}
      </p>

      <p class="funnel-chart__error-description">
        {{ $t('widgets.graph_funnel.error.description') }}
      </p>

      <UnnnicButton
        :text="$t('reload')"
        type="primary"
        size="small"
        @click="$emit('reload')"
      />
    </section>
    <UnnnicChartFunnel
      v-else
      :data="formattedChartData"
      type="default"
    />
  </section>
</template>

<script>
import IconLoading from '@/components/IconLoading.vue';
import {
  colorYellow300,
  colorOrange300,
  colorPurple300,
  colorBlue300,
  colorGreen300,
} from '@weni/unnnic-system/tokens/colors';

export default {
  name: 'FunnelChart',

  components: { IconLoading },

  props: {
    isLoading: Boolean,
    hasError: Boolean,
    chartData: {
      type: Array,
      required: true,
    },
  },

  emits: ['reload'],

  computed: {
    formattedChartData() {
      const arrayColors = [
        colorYellow300,
        colorOrange300,
        colorPurple300,
        colorBlue300,
        colorGreen300,
      ];

      if (!Array.isArray(this.chartData)) return [];

      return this.chartData.map((item, index) => {
        return {
          description: item.description,
          title: `${parseFloat(item.percentage).toLocaleString(
            this.$i18n.locale || 'en-US',
            {
              minimumFractionDigits: 2,
            },
          )}%`,
          value: `${item.total.toLocaleString(this.$i18n.locale || 'en-US')}`,
          color: arrayColors[index],
        };
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.funnel-chart {
  height: 100%;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  &__loading {
    margin: auto;
  }

  &__error {
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

  :deep(.unnnic-chart-funnel-base-item) {
    position: relative;
    z-index: 2;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -1px;
      width: 100%;
      height: 1px;
      background-color: $unnnic-color-neutral-soft;
      z-index: 1;
    }

    &:last-of-type::after {
      display: none;
    }
  }

  :deep(.overflow-hidden:after) {
    height: 0px;
  }

  :deep(.unnnic-chart-funnel-base-item__text:after) {
    height: 0px;
  }
}

.funnel-chart-three {
  height: 85%;
  :deep(.unnnic-chart-funnel-base-item) {
    .w-60 {
      width: 60%;
    }

    .w-50 {
      width: 47%;
    }

    .w-40 {
      width: 34%;
    }
  }

  @media screen and (max-width: 1024px) {
    :deep(.unnnic-chart-funnel-base-item) {
      .w-60 {
        width: 60%;
      }

      .w-50 {
        width: 35%;
      }

      .w-40 {
        width: 19%;
      }
    }
  }
}

.funnel-chart-default {
  @media screen and (max-width: 1024px) {
    :deep(.unnnic-chart-funnel-base-item) {
      .w-60 {
        width: 60%;
      }

      .w-50 {
        width: 42%;
      }

      .w-40 {
        width: 31%;
      }

      .w-30 {
        width: 21%;
      }

      .w-20 {
        width: 11%;
      }
    }
  }
}
</style>
