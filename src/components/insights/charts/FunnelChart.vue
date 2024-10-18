<template>
  <section class="funnel-chart">
    <IconLoading
      v-if="isLoading"
      class="funnel-chart__loading"
    />
    <UnnnicChartFunnel
      v-else
      :data="formattedChartData"
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
      if (!Array.isArray(this.chartData)) return [];
      return this.chartData.map((item) => {
        return {
          description: item.description,
          title: `${parseFloat(item.percentage).toLocaleString(
            this.$i18n.locale || 'en-US',
            {
              minimumFractionDigits: 2,
            },
          )}% (${item.total.toLocaleString(this.$i18n.locale || 'en-US')})`,
        };
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.funnel-chart {
  height: 100%;

  display: flex;

  &__loading {
    margin: auto;
  }
}
</style>
