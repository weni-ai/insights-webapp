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
import { mapState } from 'vuex';

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
    ...mapState({
      projectFlows: (state) => state.project.flows,
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
      this.$emit(
        'update:model-value',
        newResult?.[0]?.value ? newResult?.[0].value : newResult?.[0],
      );
    },
  },

  created() {
    this.updateFlowResultsOptions();
    this.treatModelValue();
  },

  methods: {
    treatModelValue() {
      const { modelValue } = this;
      const selectEmpty = [this.flowResultsOptionsPlaceholder];

      if (!modelValue) {
        this.flowResult = selectEmpty;
        return;
      }

      const modelValueByTypeMap = {
        string: [
          this.flowResults.find((result) => result.value === modelValue),
        ],
        object: Array.isArray(modelValue) ? modelValue : [modelValue],
      };

      this.flowResult = modelValueByTypeMap[typeof modelValue] || selectEmpty;
    },

    updateFlowResultsOptions() {
      this.flowResultsOptions = [
        this.flowResultsOptionsPlaceholder,
        ...this.flowResults,
      ];
    },
  },
};
</script>
