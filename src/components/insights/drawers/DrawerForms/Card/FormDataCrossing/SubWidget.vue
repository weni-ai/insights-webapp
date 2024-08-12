<template>
  <FormAccordion
    :key="config.title"
    :active="active"
    :title="config.title"
    :validConfig="!!config.flow.uuid"
    highlighted
    @update:active="$emit('update:active', $event)"
  >
    <template #content>
      <section class="subwidget-form">
        <SelectFlow v-model="config.flow.uuid" />

        <RadioList
          v-model:selected-radio="config.result_type"
          :label="$t('drawers.config_card.result_type')"
          :radios="result_types"
          :wrap="false"
        />

        <template v-if="config.result_type === 'flow_result'">
          <SelectFlowResult
            v-model="config.flow.result"
            :flow="config.flow?.uuid"
            :disabled="!config.flow?.uuid"
          />

          <RadioList
            v-model:selected-radio="config.operation"
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
  title: string;
  result_type: string;
  operation: string;
  flow: {
    uuid: string;
    result: string;
    result_correspondence: string;
  };
  active: boolean;
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
    modelValue: {
      type: Object as () => SubWidget,
      required: true,
    },

    active: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:active', 'update:model-value'],

  data() {
    return {
      config: this.modelValue,
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

  watch: {
    config: {
      deep: true,
      handler(newConfig) {
        this.$emit('update:model-value', newConfig);
      },
    },
  },
});
</script>
