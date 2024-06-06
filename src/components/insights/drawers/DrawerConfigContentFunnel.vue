<template>
  <MetricAccordion
    v-for="(metric, index) of metrics"
    :key="metric.title"
    :active="activeMetric === index"
    @update:active="updateActiveMetric(index, $event)"
    v-model:name="metric.name"
    v-model:flow="metric.flow"
    :title="metric.title"
    :flowsOptions="flowsOptions"
  />

  <UnnnicButton
    text="Adicionar métrica"
    iconLeft="add"
    type="tertiary"
    :disabled="metrics.length >= 5"
    @click="addMetric"
  />
</template>

<script>
import MetricAccordion from '@/components/MetricAccordion.vue';

export default {
  name: 'DrawerConfigContentFunnel',

  emits: ['update:model-value', 'update-disable-primary-button'],

  components: {
    MetricAccordion,
  },

  props: {
    modelValue: {
      type: {},
      default: () => {},
    },
    flowsOptions: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      metrics: [
        { title: 'Primeira métrica', name: '', flow: [], active: true },
        { title: 'Segunda métrica', name: '', flow: [], active: false },
        { title: 'Terceira métrica', name: '', flow: [], active: false },
      ],
      activeMetric: 0,
    };
  },

  computed: {
    validMetricsLength() {
      return this.metrics.filter((metric) => metric.name && metric.flow.length)
        .length;
    },
  },

  methods: {
    updateActiveMetric(index, isActive) {
      if (isActive) {
        this.activeMetric = index;
      }
      this.metrics[index].active = isActive;
    },

    addMetric() {
      const newMetric = {
        title: this.metrics.length === 3 ? 'Quarta métrica' : 'Quinta métrica',
        name: '',
        flow: [],
        active: false,
      };

      if (this.metrics.length < 5) {
        this.metrics.push(newMetric);
      }
    },
  },

  watch: {
    metrics: {
      deep: true,
      handler(newMetrics) {
        this.$emit('update:model-value', newMetrics);
      },
    },

    validMetricsLength: {
      immediate: true,
      handler(newValidMetricsLength) {
        this.$emit('update-disable-primary-button', newValidMetricsLength < 3);
      },
    },
  },
};
</script>
