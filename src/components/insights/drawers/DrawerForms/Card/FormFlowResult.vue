<template>
  <SelectFlow v-model="config.flow" />

  <SelectFlowResult
    v-model="config.result.name"
    :flow="config.flow?.value || config.flow"
    :disabled="!config.flow?.value || !config.flow"
  />

  <RadioList
    v-model:selected-radio="config.result.operation"
    :label="$t('drawers.config_card.operation')"
    :radios="operations"
  />

  <section>
    <UnnnicLabel :label="$t('drawers.config_card.format')" />
    <UnnnicCheckbox
      :modelValue="config.result.currency"
      :textRight="$t('drawers.config_card.checkbox.currency')"
      :disabled="config.result.operation === 'recurrence'"
      @change="config.result.currency = $event"
    />
  </section>
</template>

<script>
import SelectFlow from '@/components/SelectFlow.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';
import RadioList from '@/components/RadioList.vue';

export default {
  name: 'FormFlowResult',

  components: {
    SelectFlow,
    SelectFlowResult,
    RadioList,
  },

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        flow: null,
        result: {
          name: '',
          operation: '',
          currency: false,
        },
      }),
    },
  },

  emits: ['update:model-value', 'update:is-valid-form'],

  data() {
    return {
      config: this.modelValue,

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
    };
  },

  computed: {
    isValidForm() {
      const { config } = this;
      const isResultValid =
        config.result.name?.value ||
        (typeof config.result.name === 'string' && config.result.name);

      return config.flow?.value && isResultValid && config.result.operation;
    },
  },

  watch: {
    config: {
      deep: true,
      handler(newConfig) {
        this.$emit('update:model-value', newConfig);
      },
    },

    'config.flow'(_newFlow, oldFlow) {
      if (typeof oldFlow === 'object') {
        this.config.result.name = '';
      }
    },

    'config.result.operation'(newOperation) {
      if (newOperation === 'recurrence') this.config.result.currency = false;
    },

    isValidForm: {
      immediate: true,
      handler(newIsValidForm) {
        this.$emit('update:is-valid-form', newIsValidForm);
      },
    },
  },
};
</script>
