<template>
  <FormAccordion
    v-for="(metric, index) of metrics"
    :key="metric.title"
    :active="activeMetric === index"
    :title="metric.title"
    :validConfig="!!metric.flow && !!metric.name.trim()"
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
  </FormAccordion>
  <UnnnicButton
    :text="$t('drawers.config_funnel.add_metric')"
    iconLeft="add"
    type="secondary"
    :disabled="metrics.length >= 5"
    @click="addMetric"
  />
  <UnnnicButton
    class="clear-fields-btn"
    :text="$t('drawers.clear_all_fields')"
     type="secondary"
    :disabled="isDisableClearFields"
    @click="clearAllFields"
  />
  <UnnnicButton
    class="clear-widget-btn"
    :text="$t('drawers.reset_widget')"
    type="tertiary"
    @click="resetWidget"
  />

</template>

<script>
import { mapState } from 'vuex';

import FormAccordion from '@/components/FormAccordion.vue';
import SelectFlow from '@/components/SelectFlow.vue';

export default {
  name: 'DrawerConfigContentFunnel',

  components: {
    FormAccordion,
    SelectFlow,
  },

  props: {
    modelValue: {
      type: {},
      default: () => {},
    },
  },

  emits: [
    'update:model-value',
    'update-disable-primary-button',
    'reset-widget',
  ],

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
    isDisableClearFields() {
      return this.metrics.some((e) => e.name === '' || e.flow === '');
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
      const isCreatedMetric = [3, 4].includes(index);
      if (isCreatedMetric) {
        return this.metrics.splice(index, 1);
      }

      this.metrics[index].name = '';
      this.metrics[index].flow = '';
    },
    clearAllFields() {
      const isCreatedMetric = this.metrics.length > 3;

      if (isCreatedMetric) {
        this.metrics.splice(3, this.metrics.length - 3);
      }

      this.metrics.forEach((metric) => {
        metric.name = '';
        metric.flow = '';
      });
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
    resetWidget() {
      this.$emit('reset-widget');
    },
  },
};
</script>

<style lang="scss" scoped>
.metric-form {
  display: grid;
  gap: $unnnic-spacing-nano;

  .clear-button {
    margin-top: $unnnic-spacing-nano;
  }
}
</style>
