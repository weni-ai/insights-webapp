<template>
  <SelectFlow v-model="config.flow.uuid" />
</template>

<script>
import { mapActions, mapState } from 'vuex';

import SelectFlow from '@/components/SelectFlow.vue';

export default {
  name: 'FormExecutions',

  components: {
    SelectFlow,
  },

  emits: ['update:is-valid-form'],

  data() {
    return {
      config: null,
    };
  },

  computed: {
    ...mapState({
      widgetConfig: (state) => state.widgets.currentWidgetEditing.config,
    }),

    isValidForm() {
      return !!this.config?.flow?.uuid;
    },
  },

  watch: {
    config: {
      deep: true,
      handler(newConfig) {
        this.updateCurrentWidgetEditingConfig({
          ...this.widgetConfig,
          ...newConfig,
        });
      },
    },

    isValidForm: {
      immediate: true,
      handler(newIsValidForm) {
        this.$emit('update:is-valid-form', newIsValidForm);
      },
    },
  },

  created() {
    this.config = {
      flow: {
        uuid: this.widgetConfig.flow.uuid,
      },
    };
  },

  methods: {
    ...mapActions({
      updateCurrentWidgetEditingConfig:
        'widgets/updateCurrentWidgetEditingConfig',
    }),
  },
};
</script>
