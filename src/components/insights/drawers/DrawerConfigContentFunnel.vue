<template>
  <MetricAccordion
    v-for="(metric, index) of metrics"
    :key="metric.title"
    v-model:name="metric.name"
    v-model:flow="metric.flow"
    :active="activeMetric === index"
    :title="metric.title"
    :flowsOptions="flowsOptions"
    @update:active="updateActiveMetric(index, $event)"
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

  emits: ['update:model-value', 'update-disable-primary-button'],

  data() {
    return {
      metrics: [
        { title: 'Primeira métrica', name: '', flow: [], active: true },
        { title: 'Segunda métrica', name: '', flow: [], active: false },
        { title: 'Terceira métrica', name: '', flow: [], active: false },
      ],
      activeMetric: null,
    };
  },

  computed: {
    validMetricsLength() {
      return this.metrics.filter((metric) => metric.name && metric.flow.length)
        .length;
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

  mounted() {
    this.$nextTick().then(() => {
      this.activeMetric = 0;
    });
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
};
</script>
