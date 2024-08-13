<template>
  <SelectFlow v-model="config.flow.uuid" />

  <SelectFlowResult
    v-model="config.flow.result"
    :flow="config.flow?.uuid"
    :disabled="!config.flow?.uuid"
  />

  <RadioList
    v-model:selected-radio="config.operation"
    :label="$t('drawers.config_card.operation')"
    :radios="operations"
  />

  <section>
    <UnnnicLabel :label="$t('drawers.config_card.format')" />
    <UnnnicCheckbox
      :modelValue="config.currency"
      :textRight="$t('drawers.config_card.checkbox.currency')"
      :disabled="config.operation === 'recurrence'"
      @change="config.currency = $event"
    />
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';

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

  emits: ['update:is-valid-form'],

  data() {
    return {
      config: null,

      operations: [
        {
          value: 'sum',
          label: this.$t('drawers.config_card.radios.total'),
        },
        {
          value: 'max',
          label: this.$t('drawers.config_card.radios.highest_value'),
        },
        {
          value: 'avg',
          label: this.$t('drawers.config_card.radios.avg'),
        },
        {
          value: 'min',
          label: this.$t('drawers.config_card.radios.lowest_value'),
        },
        {
          value: 'recurrence',
          label: this.$t('drawers.config_card.radios.recurrence'),
        },
      ],
    };
  },

  computed: {
    ...mapState({
      widgetConfig: (state) => state.widgets.currentWidgetEditing.config,
    }),

    isValidForm() {
      const { config } = this;

      return config?.flow.uuid && config?.flow.result && config?.operation;
    },
  },

  watch: {
    config: {
      deep: true,
      handler(newConfig) {
        this.updateCurrentWidgetEditingConfig({
          ...this.widgetConfig,
          ...newConfig,
        });
      },
    },

    'config?.flow.uuid'(_newFlow, oldFlow) {
      if (typeof oldFlow === 'object') {
        this.config.flow.result = '';
      }
    },

    'config?.operation'(newOperation) {
      if (newOperation === 'recurrence') this.config.currency = false;
    },

    isValidForm: {
      immediate: true,
      handler(newIsValidForm) {
        this.$emit('update:is-valid-form', newIsValidForm);
      },
    },
  },

  created() {
    const { widgetConfig } = this;
    this.config = {
      flow: {
        uuid: widgetConfig.flow?.uuid || '',
        result: widgetConfig.flow?.result || '',
      },
      operation: widgetConfig.operation || '',
      currency: widgetConfig.currency || false,
    };
  },

  methods: {
    ...mapActions({
      updateCurrentWidgetEditingConfig:
        'widgets/updateCurrentWidgetEditingConfig',
    }),
  },
};
</script>
