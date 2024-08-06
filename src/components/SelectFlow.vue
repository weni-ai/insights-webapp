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
      type: Array,
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
      flow: this.modelValue,
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
  },
};
</script>
