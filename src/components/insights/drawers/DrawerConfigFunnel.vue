<template>
  <UnnnicDrawer
    ref="unnnicDrawer"
    class="drawer-config-funnel"
    :modelValue="modelValue"
    title="Definir métricas do gráfico"
    description="Selecione pelo menos três fluxos para obter a visualização em gráfico de funil "
    primaryButtonText="Salvar"
    :disabledPrimaryButton="validMetricsLength < 3"
    secondaryButtonText="Cancelar"
    @secondary-button-click="internalClose"
    @close="$emit('close')"
  >
    <template #content>
      <section class="drawer-config-funnel__content">
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
      </section>
    </template>
  </UnnnicDrawer>
</template>

<script>
import Projects from '@/services/api/resources/projects';

import MetricAccordion from '@/components/MetricAccordion.vue';

export default {
  name: 'DrawerConfigFunnel',

  components: {
    MetricAccordion,
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['close'],

  data() {
    return {
      metrics: [
        { title: 'Primeira métrica', name: '', flow: [], active: true },
        { title: 'Segunda métrica', name: '', flow: [], active: false },
        { title: 'Terceira métrica', name: '', flow: [], active: false },
      ],
      flowsOptions: [{ value: '', label: 'Selecionar fluxo' }],
      activeMetric: 0,
    };
  },

  created() {
    this.fetchFlowsSource();
  },

  computed: {
    validMetricsLength() {
      return this.metrics.filter((metric) => metric.name && metric.flow.length)
        .length;
    },
  },

  methods: {
    async fetchFlowsSource() {
      const response = await Projects.getProjectSource('flows');
      response?.forEach((source) => {
        this.flowsOptions.push({ value: source.uuid, label: source.name });
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
        title: this.metrics.length === 3 ? 'Quarta métrica' : 'Quinta métrica',
        name: '',
        flow: [],
        active: false,
      };

      if (this.metrics.length < 5) {
        this.metrics.push(newMetric);
      }
    },

    internalClose() {
      this.$refs.unnnicDrawer.close();
    },
  },
};
</script>

<style lang="scss" scoped>
.drawer-config-funnel {
  &__content {
    display: grid;
    gap: $unnnic-spacing-sm;
  }
}
</style>
