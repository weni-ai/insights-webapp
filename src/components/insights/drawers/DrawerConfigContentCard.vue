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
    :disabled="disableResetWidgetButton"
    @click="$emit('reset-widget')"
  />
</template>

<script>
import { checkDeepEmptyValues, deepMerge } from '@/utils/object';

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
      initialConfigStringfy: '',
      widget: this.modelValue,
      config: { name: this.modelValue.name, ...this.modelValue.config },
      isCurrentFormValid: false,
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
        'update:is-valid-form': (isValid) =>
          (this.isCurrentFormValid = isValid),
      };

      const mappingEvents = {};

      return { ...defaultEvents, ...mappingEvents[this.type] };
    },

    isAllFieldsValid() {
      return this.config.name && this.isCurrentFormValid;
    },

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
          op_field: config.result?.name,
          ...operationRecurrenceConfigs,
        },
      };
    },

    disableResetWidgetButton() {
      return checkDeepEmptyValues(this.config);
    },
  },

  watch: {
    treatedConfig: {
      immediate: true,
      deep: true,
      handler(newConfig) {
        this.$emit('update:model-value', newConfig);

        this.initializeConfigString();
        this.updatePrimaryButtonState();
      },
    },

    isAllFieldsValid() {
      this.updatePrimaryButtonState();
    },
  },

  methods: {
    initializeConfigString() {
      if (this.treatedConfig && !this.initialConfigStringfy) {
        this.initialConfigStringfy = JSON.stringify(this.treatedConfig);
      }
    },
    updatePrimaryButtonState() {
      const disablePrimaryButton =
        this.initialConfigStringfy === JSON.stringify(this.treatedConfig) ||
        !this.isAllFieldsValid;

      this.$emit('update-disable-primary-button', disablePrimaryButton);
    },
  },
};
</script>
