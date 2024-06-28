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
    :text="$t('drawers.config_funnel.add_metric')"
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
        {
          title: this.$t('drawers.config_funnel.first_metric'),
          name: '',
          flow: [],
          active: true,
        },
        {
          title: this.$t('drawers.config_funnel.second_metric'),
          name: '',
          flow: [],
          active: false,
        },
        {
          title: this.$t('drawers.config_funnel.third_metric'),
          name: '',
          flow: [],
          active: false,
        },
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
    this.handleWidgetFields();

    this.$nextTick().then(() => {
      this.activeMetric = 0;
    });
  },

  methods: {
    handleWidgetFields() {
      Object.values(this.modelValue.config).forEach((metric, index) => {
        const selectedFlow =
          this.flowsOptions.find(
            (flow) => flow.value === metric.filter?.flow,
          ) || {};

        if (!this.metrics[index]) {
          this.addMetric();
        }

        this.metrics[index] = {
          ...this.metrics[index],
          name: metric.name,
          flow: [selectedFlow],
        };
      });
    },

    updateActiveMetric(index, isActive) {
      if (isActive) {
        this.activeMetric = index;
      }
      this.metrics[index].active = isActive;
    },

    addMetric() {
      const newMetric = {
        title:
          this.metrics.length === 3
            ? this.$t('drawers.config_funnel.fourth_metric')
            : this.$t('drawers.config_funnel.fifth_metric'),
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
