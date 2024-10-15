<template>
  <section class="funnel-chart">
    <IconLoading
      v-if="isLoading"
      class="funnel-chart__loading"
    />
    <UnnnicChartFunnel
      v-else
      :data="[...chartData]"
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
      type: Object,
      required: true,
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
