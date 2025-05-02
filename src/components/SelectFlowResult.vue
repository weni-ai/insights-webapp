<template>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.flow_result.label')" />
    <UnnnicSelectSmart
      v-bind="$attrs"
      v-model="flowResult"
      :disabled="!flowResults.length"
      :options="
        flowResultsOptions.length
          ? flowResultsOptions
          : [flowResultsOptionsPlaceholder]
      "
      autocomplete
      autocompleteIconLeft
      autocompleteClearOnFocus
      selectFirst
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
      flowResultsOptionsPlaceholder: {
        label: this.$t('drawers.config_card.flow_result.placeholder'),
        value: '',
      },
      flowResultsOptions: [],
      flowResult: [],
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
    selectEmpty() {
      return [this.flowResultsOptionsPlaceholder];
    },
  },

  watch: {
    modelValue: 'treatModelValue',

    flow: 'updateFlowResultsOptions',

    flowResult(newResult) {
      this.$emit('update:model-value', newResult?.[0]?.value);
    },
  },

  created() {
    this.updateFlowResultsOptions();
    this.treatModelValue();
  },

  methods: {
    treatModelValue() {
      const { modelValue } = this;

      if (!modelValue) {
        this.flowResult = this.selectEmpty;
        return;
      }

      const modelValueByTypeMap = {
        string: [
          this.flowResults.find((result) => result.value === modelValue),
        ],
        object: Array.isArray(modelValue) ? modelValue : [modelValue],
      };

      this.flowResult =
        modelValueByTypeMap[typeof modelValue] || this.selectEmpty;
    },

    updateFlowResultsOptions() {
      this.flowResultsOptions = [
        this.flowResultsOptionsPlaceholder,
        ...this.flowResults,
      ];
      this.flowResult = this.selectEmpty;
    },
  },
};
</script>
