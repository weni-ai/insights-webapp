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
  <template v-if="type === 'flow_result'">
    <section>
      <UnnnicLabel :label="$t('drawers.config_card.flow_result.label')" />
      <UnnnicSelectSmart
        v-model="config.result.name"
        :options="
          flowResultsOptions.length
            ? flowResultsOptions
            : [flowResultsOptionsPlaceholder]
        "
        autocomplete
        autocompleteIconLeft
        autocompleteClearOnFocus
        selectFirst
        :disabled="!flowResultsOptions[1]?.value"
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
  <UnnnicButton
    :text="$t('drawers.reset_widget')"
    type="tertiary"
    :disabled="isAllFieldsEmpty"
    @click="$emit('reset-widget')"
  />
</template>

<script>
import { parseValue } from '@/utils/object';

export default {
  name: 'DrawerConfigContentCard',

  props: {
    modelValue: {
      type: {},
      default: () => {},
    },
    flows: {
      type: Array,
      default: () => [],
    },
    flowsOptions: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: '',
      validate(value) {
        return ['executions', 'flow_result'].includes(value);
      },
    },
  },

  emits: [
    'update:model-value',
    'update-disable-primary-button',
    'reset-widget',
  ],

  data() {
    return {
      initialConfigStringfy: {},
      config: {
        name: '',
        flow: [],
        result: {
          name: [],
          operation: 'count',
        },
      },
      operations: [
        {
          value: 'sum',
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

      flowResultsOptionsPlaceholder: {
        label: this.$t('drawers.config_card.flow_result.placeholder'),
        value: '',
      },
    };
  },

  computed: {
    baseFields() {
      const { config } = this;
      return [config.name, config.flow[0]?.value];
    },

    flowResultFields() {
      const { config } = this;
      return [
        config.result.name[0]?.value,
        config.result.operation === 'count' ? '' : config.result.operation,
      ];
    },

    isAllBaseFieldsFilled() {
      return this.baseFields.every((field) => !!field);
    },

    isAllFlowResultFieldsFilled() {
      return this.flowResultFields.every((field) => !!field);
    },

    isAllFieldsEmpty() {
      const anyBaseField = this.baseFields.find((field) => !!field);
      const anyFlowResultField = this.flowResultFields.find((field) => !!field);

      return !anyBaseField && !anyFlowResultField;
    },

    isConfigValid() {
      if (!this.isAllBaseFieldsFilled) {
        return false;
      }

      if (this.type === 'flow_result' && !this.isAllFlowResultFieldsFilled) {
        return false;
      }

      if (this.initialConfigStringfy === JSON.stringify(this.config)) {
        return false;
      }

      return true;
    },

    flowResultsOptions() {
      const selectedFlowUuid = this.config.flow?.[0]?.value;

      if (selectedFlowUuid) {
        const selectedFlowMedatada = parseValue(
          this.flows.find((flow) => flow.uuid === selectedFlowUuid).metadata,
        );

        if (!selectedFlowMedatada?.results) return [];

        const { results } = selectedFlowMedatada;

        let resultsFormatted = [];

        if (results.length) {
          resultsFormatted = [
            this.flowResultsOptionsPlaceholder,
            ...results.map((result) => {
              return { value: result.key, label: result.name };
            }),
          ];
        }
        return resultsFormatted;
      }
      return [];
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

    'config.flow'() {
      this.config.result.name = [this.flowResultsOptionsPlaceholder];
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

      this.config.flow = [selectedFlow];

      const selectedFlowResults = this.flowResultsOptions.find(
        (result) => result.value === this.modelValue.config.op_field,
      );

      this.config = {
        ...this.config,
        name: this.modelValue.name,
        result: {
          name: selectedFlowResults
            ? [selectedFlowResults]
            : [this.flowResultsOptionsPlaceholder],
          operation:
            this.modelValue.config.operation || this.config.result.operation,
        },
      };
      this.initialConfigStringfy = JSON.stringify(this.config);
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
