<template>
  <section>
    <UnnnicLabel
      data-testid="select-flow-label"
      :label="$t('drawers.config_card.select_origin_flow')"
    />
    <UnnnicSelect
      v-bind="$attrs"
      v-model="flow"
      :options="flowsOptions"
      enableSearch
      :search="searchText"
      :placeholder="$t('drawers.config_funnel.select_flow')"
      itemLabel="label"
      itemValue="value"
      @update:search="searchText = $event"
    />
  </section>
</template>
<script>
import { useProject } from '@/store/modules/project';
import { mapState } from 'pinia';

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
      flowsOptions: [],
      flow: '',
      searchText: '',
    };
  },

  computed: {
    ...mapState(useProject, {
      projectFlows: 'flows',
    }),
  },

  watch: {
    flow(newFlow) {
      this.$emit('update:model-value', newFlow || '');
    },
    modelValue() {
      this.treatModelValue();
    },
    projectFlows() {
      this.flowsOptions = [...this.projectFlows];
      this.treatModelValue();
    },
  },

  created() {
    this.flowsOptions = [...this.projectFlows];
    this.treatModelValue();
  },

  methods: {
    treatModelValue() {
      const { modelValue } = this;

      if (!modelValue || (Array.isArray(modelValue) && !modelValue.length)) {
        this.flow = '';
        return;
      }

      if (typeof modelValue === 'string') {
        this.flow = modelValue;
        return;
      }

      if (Array.isArray(modelValue) && modelValue.length) {
        this.flow = modelValue[0]?.value || '';
        return;
      }

      if (typeof modelValue === 'object') {
        this.flow = modelValue.value || '';
        return;
      }

      this.flow = '';
    },
  },
};
</script>

<style lang="scss">
.unnnic-popover {
  background-color: $unnnic-color-background-snow;
}
</style>
