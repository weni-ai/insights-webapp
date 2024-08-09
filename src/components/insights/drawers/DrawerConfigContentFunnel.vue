<template>
  <MetricAccordion
    v-for="(metric, index) of metrics"
    :key="metric.title"
    :active="activeMetric === index"
    :title="metric.title"
    :validConfig="!!metric.flow && !!metric.name.trim()"
    highlighted
    @update:active="updateActiveMetric(index, $event)"
  >
    <template #content>
      <section class="metric-form">
        <section>
          <UnnnicLabel :label="$t('metric_accordion.name_metric.label')" />
          <UnnnicInput
            v-model="metric.name"
            :placeholder="$t('metric_accordion.name_metric.placeholder')"
          />
        </section>
        <SelectFlow v-model="metric.flow" />
        <UnnnicButton
          class="clear-button"
          :text="$t('clear_fields')"
          type="tertiary"
          :disabled="!metric.flow && !metric.name"
          @click="clearFields(index)"
        />
      </section>
    </template>
  </MetricAccordion>
  <UnnnicButton
    :text="$t('drawers.config_funnel.add_metric')"
    iconLeft="add"
    type="tertiary"
    :disabled="metrics.length >= 5"
    @click="addMetric"
  />
</template>

<script>
import { mapState } from 'vuex';

import MetricAccordion from '@/components/MetricAccordion.vue';
import SelectFlow from '@/components/SelectFlow.vue';

export default {
  name: 'DrawerConfigContentFunnel',

  components: {
    MetricAccordion,
    SelectFlow,
  },

  props: {
    modelValue: {
      type: {},
      default: () => {},
    },
  },

  emits: ['update:model-value', 'update-disable-primary-button'],

  data() {
    return {
      initialMetricsStringfy: '',
      metrics: [
        {
          title: this.$t('drawers.config_funnel.first_metric'),
          name: '',
          flow: '',
          active: true,
        },
        {
          title: this.$t('drawers.config_funnel.second_metric'),
          name: '',
          flow: '',
          active: false,
        },
        {
          title: this.$t('drawers.config_funnel.third_metric'),
          name: '',
          flow: '',
          active: false,
        },
      ],
      activeMetric: null,
    };
  },

  computed: {
    ...mapState({
      projectFlows: (state) => state.project.flows,
    }),

    validMetricsLength() {
      return this.metrics.filter((metric) => metric.name && metric.flow).length;
    },
    isValidMetrics() {
      if (this.validMetricsLength < 3) {
        return false;
      }
      const metricsToCompare = this.metrics.map((metric) => {
        delete metric.active;
        return metric;
      });

      if (metricsToCompare.some((metric) => !metric.flow)) {
        return false;
      }

      if (this.initialMetricsStringfy === JSON.stringify(metricsToCompare)) {
        return false;
      }
      return true;
    },
  },

  watch: {
    metrics: {
      deep: true,
      handler(newMetrics) {
        this.$emit('update:model-value', newMetrics);
      },
    },

    isValidMetrics: {
      immediate: true,
      handler() {
        this.$emit('update-disable-primary-button', !this.isValidMetrics);
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
    clearFields(index) {
      this.metrics[index].name = '';
      this.metrics[index].flow = '';
    },

    handleWidgetFields() {
      Object.values(this.modelValue.config).forEach((metric, index) => {
        const selectedFlow =
          this.projectFlows.find(
            (flow) => flow.value === metric.filter?.flow,
          ) || {};

        if (!this.metrics[index]) {
          this.addMetric();
        }

        this.metrics[index] = {
          ...this.metrics[index],
          name: metric.name,
          flow: selectedFlow?.value,
        };
      });
      this.initialMetricsStringfy = JSON.stringify(
        this.metrics.map((metric) => {
          delete metric.active;
          return metric;
        }),
      );
    },

    updateActiveMetric(index, isActive) {
      this.metrics[index].active = isActive;
      if (isActive) {
        this.activeMetric = index;
      }
      if (this.activeMetric === index && !isActive) {
        this.activeMetric = null;
      }
    },

    addMetric() {
      const newMetric = {
        title:
          this.metrics.length === 3
            ? this.$t('drawers.config_funnel.fourth_metric')
            : this.$t('drawers.config_funnel.fifth_metric'),
        name: '',
        flow: '',
        active: false,
      };

      if (this.metrics.length < 5) {
        this.metrics.push(newMetric);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.metric-form {
  margin-top: - calc($unnnic-spacing-ant + $unnnic-spacing-nano);
  padding: $unnnic-spacing-xs $unnnic-spacing-ant 0;

  display: grid;
  gap: $unnnic-spacing-nano;

  .clear-button {
    margin-top: $unnnic-spacing-nano;
  }
}
</style>
