<template>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.flow_result.label')" />
    <UnnnicSelect
      v-bind="$attrs"
      :modelValue="flowResult"
      :disabled="!flowResults.length"
      :options="flowResultsOptions"
      enableSearch
      :search="searchText"
      :placeholder="$t('drawers.config_card.flow_result.placeholder')"
      itemLabel="label"
      itemValue="value"
      @update:model-value="handleSelect"
      @update:search="searchText = $event"
    />
  </section>
</template>
<script>
import { useProject } from '@/store/modules/project';
import { mapState } from 'pinia';

export default {
  name: 'SelectFlowResult',

  props: {
    modelValue: {
      type: [Array, String, Object],
      default: () => [],
    },

    flow: {
      type: String,
      required: true,
    },
  },

  emits: ['update:model-value'],

  data() {
    return {
      flowResultsOptions: [],
      flowResult: '',
      searchText: '',
    };
  },

  computed: {
    ...mapState(useProject, {
      projectFlows: 'flows',
    }),

    flowResults() {
      return (
        this.projectFlows.find((flow) => flow.value === this.flow)?.results ||
        []
      );
    },
  },

  watch: {
    modelValue: 'treatModelValue',

    flow: 'updateFlowResultsOptions',

    flowResult(newResult) {
      this.$emit('update:model-value', newResult || '');
    },
  },

  created() {
    this.updateFlowResultsOptions();
    this.treatModelValue();
  },

  methods: {
    handleSelect(value) {
      this.flowResult = value;
    },

    treatModelValue() {
      const { modelValue } = this;

      if (!modelValue) {
        this.flowResult = '';
        return;
      }

      if (typeof modelValue === 'string') {
        this.flowResult = modelValue;
        return;
      }

      if (Array.isArray(modelValue) && modelValue.length) {
        this.flowResult = modelValue[0]?.value || '';
        return;
      }

      if (typeof modelValue === 'object') {
        this.flowResult = modelValue.value || '';
        return;
      }

      this.flowResult = '';
    },

    updateFlowResultsOptions() {
      this.flowResultsOptions = [...this.flowResults];
      this.flowResult = '';
      this.searchText = '';
    },
  },
};
</script>
