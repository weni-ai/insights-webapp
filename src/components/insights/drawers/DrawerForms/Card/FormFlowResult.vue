<template>
  <SelectFlow v-model="config.flow" />

  <SelectFlowResult
    v-model="config.result.name"
    :flow="config.flow?.value || config.flow"
    :disabled="!config.flow?.value || !config.flow"
  />
</template>

<script>
import SelectFlow from '@/components/SelectFlow.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';

export default {
  name: 'FormFlowResult',

  components: {
    SelectFlow,
    SelectFlowResult,
  },

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        flow: null,
        result: {
          name: '',
        },
      }),
    },
  },

  emits: ['update:model-value'],

  data() {
    return {
      config: this.modelValue,
    };
  },

  watch: {
    config: {
      deep: true,
      handler(newConfig) {
        this.$emit('update:model-value', { ...newConfig });
      },
    },
  },
};
</script>
