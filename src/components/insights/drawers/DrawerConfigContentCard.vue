<template>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.name_card.label')" />
    <UnnnicInput
      v-model="config.name"
      :placeholder="$t('drawers.config_card.name_card.placeholder')"
    />
  </section>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.select_origin_flow')" />
    <UnnnicSelectSmart
      v-model="config.flow"
      :options="flowsOptions"
      autocomplete
      autocompleteIconLeft
      autocompleteClearOnFocus
    />
  </section>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.result_type')" />
    <section class="drawer-config-content-card__result-types">
      <template
        v-for="resultType in resultTypes"
        :key="resultType.value"
      >
        <UnnnicRadio
          v-model="config.resultType"
          :value="resultType.value"
        >
          {{ resultType.label }}
        </UnnnicRadio>
      </template>
    </section>
  </section>
  <template v-if="config.resultType === 'results'">
    <section>
      <UnnnicLabel :label="$t('drawers.config_card.flow_result.label')" />
      <UnnnicInput
        v-model="config.result.name"
        :placeholder="$t('drawers.config_card.flow_result.placeholder')"
      />
    </section>
    <section>
      <UnnnicLabel :label="$t('drawers.config_card.operation')" />
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
      config: {
        name: '',
        flow: [],
        resultType: 'executions',
        result: {
          name: '',
          operation: 'count',
        },
      },
      resultTypes: [
        {
          value: 'executions',
          label: this.$t('drawers.config_card.radios.executions'),
        },
        {
          value: 'results',
          label: this.$t('drawers.config_card.radios.results'),
        },
      ],
      operations: [
        {
          value: 'count',
          label: this.$t('drawers.config_card.radios.total'),
        },
        {
          value: 'max',
          label: this.$t('drawers.config_card.radios.max'),
        },
        {
          value: 'avg',
          label: this.$t('drawers.config_card.radios.avg'),
        },
        {
          value: 'min',
          label: this.$t('drawers.config_card.radios.min'),
        },
        {
          value: 'recurrence',
          label: this.$t('drawers.config_card.radios.recurrence'),
        },
      ],
    };
  },

  computed: {
    isConfigValid() {
      const { config } = this;

      if (!config.name || !config.flow.length || !config.resultType) {
        return false;
      }

      if (
        config.resultType === 'results' &&
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
  mounted() {
    this.handleWidgetFields();
  },
  methods: {
    handleWidgetFields() {
      const selectedFlow =
        this.flowsOptions.find(
          (flow) => flow.value === this.modelValue.config.filter?.flow,
        ) || {};

      this.config = {
        ...this.config,
        name: this.modelValue.name,
        flow: [selectedFlow],
        resultType: this.modelValue.config.op_field ? 'results' : 'executions',
        result: {
          name: this.modelValue.config.op_field,
          operation: this.modelValue.config.operation,
        },
      };
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
