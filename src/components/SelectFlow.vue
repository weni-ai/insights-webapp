<template>
  <section>
    <UnnnicLabel
      data-testid="select-flow-label"
      :label="$t('drawers.config_card.select_origin_flow')"
    />
    <UnnnicSelectSmart
      v-bind="$attrs"
      v-model="flow"
      :options="flowsOptions"
      autocomplete
      autocompleteIconLeft
      autocompleteClearOnFocus
    />
  </section>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'SelectFlow',

  props: {
    modelValue: {
      type: [Array, String, Object],
      default: () => [],
    },
  },

  emits: ['update:model-value'],

  data() {
    return {
      flowsOptionsPlaceholder: {
        value: '',
        label: this.$t('drawers.config_funnel.select_flow'),
      },
      flowsOptions: [],
      flow: [],
    };
  },

  computed: {
    ...mapState({
      projectFlows: (state) => state.project.flows,
    }),
  },

  watch: {
    flow(newFlow) {
      this.$emit('update:model-value', newFlow?.[0].value);
    },
    modelValue() {
      this.treatModelValue();
    },
  },

  created() {
    this.flowsOptions = [this.flowsOptionsPlaceholder, ...this.projectFlows];
    this.treatModelValue();
  },

  methods: {
    treatModelValue() {
      const { modelValue } = this;

      if (!modelValue || (Array.isArray(modelValue) && !modelValue.length)) {
        this.flow = [this.flowsOptionsPlaceholder];
        return;
      }

      const modelValueByTypeMap = {
        string: [this.projectFlows.find((flow) => flow.value === modelValue)],
        object: Array.isArray(modelValue) ? modelValue : [modelValue],
      };

      this.flow = modelValueByTypeMap[typeof modelValue] || [];
    },
  },
};
</script>
