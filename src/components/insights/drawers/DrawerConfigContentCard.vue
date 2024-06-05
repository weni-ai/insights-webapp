<template>
  <section>
    <UnnnicLabel label="Nomear card" />
    <UnnnicInput
      v-model="config.name"
      placeholder="Ex: fluxos do projeto"
    />
  </section>
  <section>
    <UnnnicLabel label="Selecionar fluxo de origem" />
    <UnnnicSelectSmart
      v-model="config.flow"
      :options="flowsOptions"
      autocomplete
      autocompleteIconLeft
      autocompleteClearOnFocus
    />
  </section>
  <section>
    <UnnnicLabel label="Tipo de resultado" />
    <section class="drawer-config-content-card__result-types">
      <template
        v-for="result_type in result_types"
        :key="result_type.value"
      >
        <UnnnicRadio
          v-model="config.result_type"
          :value="result_type.value"
        >
          {{ result_type.label }}
        </UnnnicRadio>
      </template>
    </section>
  </section>
  <template v-if="config.result_type === 'results'">
    <section>
      <UnnnicLabel label="Resultado do fluxo" />
      <UnnnicInput
        v-model="config.result.name"
        placeholder="Ex: @results.wenigpt"
      />
    </section>
    <section>
      <UnnnicLabel label="Operação" />
      <section class="drawer-config-content-card__operations">
        <template
          v-for="operation in operations"
          :key="operation.value"
        >
          <UnnnicRadio
            v-model="config.result.operation"
            :value="operation.value"
          >
            {{ operation.label }}
          </UnnnicRadio>
        </template>
      </section>
    </section>
  </template>
</template>

<script>
export default {
  name: 'DrawerConfigContentCard',

  emits: ['update:model-value', 'update-disable-primary-button'],

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
      config: {
        name: '',
        flow: [],
        result_type: 'executions',
        result: {
          name: '',
          operation: 'count',
        },
      },
      result_types: [
        { value: 'executions', label: 'Execuções' },
        { value: 'results', label: 'Resultado de fluxo' },
      ],
      operations: [
        { value: 'count', label: 'Total' },
        { value: 'max', label: 'Maior valor' },
        { value: 'avg', label: 'Média' },
        { value: 'min', label: 'Menor valor' },
        { value: 'recurrence', label: 'Recorrência' },
      ],
    };
  },

  computed: {
    isConfigValid() {
      const { config } = this;

      if (!config.name || !config.flow.length || !config.result_type) {
        return false;
      }

      if (
        config.result_type === 'results' &&
        (!config.result.name || !config.result.operation)
      ) {
        return false;
      }

      return true;
    },
  },

  watch: {
    config: {
      deep: true,
      handler(newConfig) {
        console.log('newConfig', newConfig);
        this.$emit('update:model-value', newConfig);
      },
    },

    isConfigValid: {
      immediate: true,
      handler(newIsConfigValid) {
        this.$emit('update-disable-primary-button', !newIsConfigValid);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.drawer-config-content-card {
  &__result-types {
    display: grid;
    row-gap: $unnnic-spacing-nano;
  }
  &__operations {
    display: flex;
    flex-wrap: wrap;
    row-gap: $unnnic-spacing-nano;

    > * {
      width: 50%;
    }
  }
}
</style>
