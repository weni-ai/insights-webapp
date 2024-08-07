<template>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.name_card.label')" />
    <UnnnicInput
      v-model="config.name"
      :placeholder="$t('drawers.config_card.name_card.placeholder')"
    />
  </section>

  <component
    :is="currentFormComponent"
    v-bind="currentFormProps"
    v-on="currentFormEvents"
  />

  <UnnnicButton
    :text="$t('drawers.reset_widget')"
    type="tertiary"
    @click="$emit('reset-widget')"
  />
</template>

<script>
import { deepMerge } from '@/utils/object';

import FormExecutions from './DrawerForms/Card/FormExecutions.vue';
import FormFlowResult from './DrawerForms/Card/FormFlowResult.vue';

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
      widget: this.modelValue,
      config: { name: this.modelValue.name, ...this.modelValue.config },
    };
  },

  computed: {
    currentFormComponent() {
      const componentMap = {
        executions: FormExecutions,
        flow_result: FormFlowResult,
      };

      return componentMap[this.type] || null;
    },

    currentFormProps() {
      const { config } = this;
      const propsMap = {
        executions: {
          modelValue: {
            flow: config.filter.flow || '',
          },
        },
        flow_result: {
          modelValue: {
            flow: config.filter.flow || '',
            result: {
              name: config.op_field || '',
              operation: config.operation || '',
            },
          },
        },
      };

      return propsMap[this.type] || null;
    },

    currentFormEvents() {
      const defaultEvents = {
        'update:model-value': (config) =>
          (this.config = deepMerge(config, this.config)),
      };

      const mappingEvents = {};

      return { ...defaultEvents, ...mappingEvents[this.type] };
    },

    // baseFields() {
    //   const { config } = this;
    //   return [config.name, config.flow[0]?.value];
    // },

    // flowResultFields() {
    //   const { config } = this;
    //   return [
    //     config.result.name[0]?.value,
    //     config.result.operation === 'count' ? '' : config.result.operation,
    //   ];
    // },

    // isAllBaseFieldsFilled() {
    //   return this.baseFields.every((field) => !!field);
    // },

    // isAllFlowResultFieldsFilled() {
    //   return this.flowResultFields.every((field) => !!field);
    // },

    // isAllFieldsEmpty() {
    //   const anyBaseField = this.baseFields.find((field) => !!field);
    //   const anyFlowResultField = this.flowResultFields.find((field) => !!field);

    //   return !anyBaseField && !anyFlowResultField;
    // },

    // isConfigValid() {
    //   if (!this.isAllBaseFieldsFilled) {
    //     return false;
    //   }

    //   if (this.type === 'flow_result' && !this.isAllFlowResultFieldsFilled) {
    //     return false;
    //   }

    //   if (this.initialConfigStringfy === JSON.stringify(this.config)) {
    //     return false;
    //   }

    //   return true;
    // },

    // flowResultsOptions() {
    //   const selectedFlowUuid = this.config.flow?.[0]?.value;

    //   if (selectedFlowUuid) {
    //     const selectedFlowMedatada = parseValue(
    //       this.flows.find((flow) => flow.uuid === selectedFlowUuid).metadata,
    //     );

    //     if (!selectedFlowMedatada?.results) return [];

    //     const { results } = selectedFlowMedatada;

    //     let resultsFormatted = [];

    //     if (results.length) {
    //       resultsFormatted = [
    //         this.flowResultsOptionsPlaceholder,
    //         ...results.map((result) => {
    //           return { value: result.key, label: result.name };
    //         }),
    //       ];
    //     }
    //     return resultsFormatted;
    //   }
    //   return [];
    // },

    treatedConfig() {
      const { config } = this;
      const configuredFlow = config?.flow;
      const operationRecurrenceConfigs =
        config.result?.operation === 'recurrence' ? { data_suffix: '%' } : {};
      return {
        name: config.name,
        report_name: `${this.$t('drawers.config_card.total_flow_executions')} ${configuredFlow?.label}`,
        config: {
          type_result: this.type,
          operation:
            this.type === 'executions' ? 'count' : config.result?.operation,
          filter: { flow: configuredFlow?.value },
          op_field: config.op_field,
          ...operationRecurrenceConfigs,
        },
      };
    },
  },

  watch: {
    treatedConfig: {
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
};
</script>
