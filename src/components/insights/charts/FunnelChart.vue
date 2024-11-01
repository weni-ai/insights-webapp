<template>
  <section class="funnel-chart">
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
}
</style>
