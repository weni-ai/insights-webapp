<template lang="">
  <UnnnicSelectSmart
    v-model="flow"
    :options="flowsOptions"
    autocomplete
    autocompleteIconLeft
    autocompleteClearOnFocus
  />
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
      this.$emit('update:model-value', newFlow?.[0]);
    },
  },

  created() {
    this.flowsOptions = [this.flowsOptionsPlaceholder, ...this.projectFlows];
    this.treatModelValue();
  },

  methods: {
    treatModelValue() {
      const { modelValue } = this;
      const modelValueByTypeMap = {
        string: [this.projectFlows.find((flow) => flow.value === modelValue)],
        object: Array.isArray(modelValue) ? modelValue : [modelValue],
      };

      this.flow = modelValueByTypeMap[typeof modelValue] || [];
    },
  },
};
</script>
