<template>
  <FormAccordion
    :title="title"
    :active="active"
    :validConfig="isValidConfig"
    highlighted
    @update:active="$emit('update:active', $event)"
  >
    <template #content>
      <section class="subwidget-form">
        <SelectFlow v-model="configLocal.flow.uuid" />

        <RadioList
          v-model:selectedRadio="configLocal.result_type"
          :label="$t('drawers.config_card.result_type')"
          :radios="result_types"
          :wrap="false"
        />

        <template v-if="configLocal.result_type === 'flow_result'">
          <SelectFlowResult
            v-model="configLocal.flow.result"
            :flow="configLocal.flow?.uuid"
            :disabled="!configLocal.flow?.uuid"
          />

          <RadioList
            v-model:selectedRadio="configLocal.operation"
            :radios="operations"
          />
        </template>
      </section>
    </template>
  </FormAccordion>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import FormAccordion from '@/components/FormAccordion.vue';
import SelectFlow from '@/components/SelectFlow.vue';
import RadioList from '@/components/RadioList.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';

interface SubWidget {
  result_type: string;
  operation: string;
  flow: {
    uuid: string;
    result: string;
    result_correspondence: string;
  };
}

export default defineComponent({
  name: 'SubWidget',

  components: {
    FormAccordion,
    SelectFlow,
    RadioList,
    SelectFlowResult,
  },

  props: {
    config: {
      type: Object as () => SubWidget,
      required: true,
    },

    title: {
      type: String,
      default: '',
    },

    active: {
      type: Boolean,
      default: false,
    },
  },

  emits: [
    'update:active',
    'update:model-value',
    'update:config',
    'is-valid-form',
  ],

  data() {
    return {
      configLocal: this.config,
      result_types: [
        {
          value: 'executions',
          label: this.$t('drawers.config_card.radios.executions'),
        },
        {
          value: 'flow_result',
          label: this.$t('drawers.config_card.radios.results'),
        },
      ],
      operations: [
        {
          value: 'sum',
          label: this.$t('drawers.config_card.radios.sum'),
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
          value: 'max',
          label: this.$t('drawers.config_card.radios.max'),
        },
      ],
    };
  },

  computed: {
    isValidConfig() {
      const { configLocal } = this;
      const mapValidations = {
        executions: true,
        flow_result: !!configLocal.flow.result && !!configLocal.operation,
      };
      return !!configLocal.flow.uuid && mapValidations[configLocal.result_type];
    },
  },

  watch: {
    configLocal: {
      deep: true,
      handler(newConfig) {
        const treatedConfig = {
          ...newConfig,
          operation:
            newConfig.result_type === 'executions'
              ? 'count'
              : newConfig.operation,
        };

        this.$emit('update:config', treatedConfig);
      },
    },

    isValidConfig: {
      immediate: true,
      handler(newIsValid) {
        this.$emit('is-valid-form', newIsValid);
      },
    },
  },
});
</script>

<style lang="scss" scoped>
.subwidget-form {
  display: grid;
  gap: $unnnic-spacing-xs;
}
</style>
