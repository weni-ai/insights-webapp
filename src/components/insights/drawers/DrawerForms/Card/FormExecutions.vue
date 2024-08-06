<template>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.select_origin_flow')" />
    <SelectFlow v-model="config.flow" />
  </section>
</template>

<script>
import SelectFlow from '@/components/SelectFlow.vue';

export default {
  name: 'FormExecutions',

  components: {
    SelectFlow,
  },

  props: {
    modelValue: {
      type: Object,
      default: () => ({
        flow: null,
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
        this.$emit('update:model-value', newConfig);
      },
    },
  },
};
</script>
