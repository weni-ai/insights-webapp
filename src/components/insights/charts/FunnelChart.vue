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
    <UnnnicChartFunnel
      v-else
      :data="formattedChartData"
      type="default"
    />
  </section>
</template>

<script>
import IconLoading from '@/components/IconLoading.vue';

export default {
  name: 'FunnelChart',

  components: { IconLoading },

  props: {
    isLoading: Boolean,
    chartData: {
      type: Array,
      required: true,
    },
  },
  computed: {
    formattedChartData() {
      const arrayColors = [
        '#F6E05E',
        '#F6AD55',
        '#B794F4',
        '#63B3ED',
        '#68D391',
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

  &__loading {
    margin: auto;
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
