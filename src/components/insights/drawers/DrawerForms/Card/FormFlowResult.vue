<template>
  <SelectFlow
    :modelValue="config.flow.uuid"
    data-test-id="select-flow"
    @update:model-value="config.flow.uuid = $event"
  />

  <SelectFlowResult
    :modelValue="config.flow.result"
    data-test-id="select-flow-result"
    :flow="config.flow?.uuid"
    :disabled="!config.flow?.uuid"
    @update:model-value="config.flow.result = $event"
  />

  <RadioList
    v-model:selected-radio="config.operation"
    data-test-id="radio-list"
    :label="$t('drawers.config_card.operation')"
    :radios="operations"
  />

  <section>
    <UnnnicLabel
      :label="$t('drawers.config_card.format')"
      data-test-id="label"
    />
    <UnnnicCheckbox
      data-test-id="check-box"
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

        if (newConfig?.operation === 'recurrence') this.config.currency = false;
      },
    },

    'config.flow.uuid'(newFlowUuid, oldFlowUuid) {
      if (oldFlowUuid && newFlowUuid !== oldFlowUuid) {
        this.config.flow.result = '';
      }
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
