<template>
  <SelectFlow v-model="config.flow.uuid" />
</template>

<script>
import { mapActions, mapState } from 'pinia';

import { useWidgets } from '@/store/modules/widgets';

import SelectFlow from '@/components/SelectFlow.vue';

export default {
  name: 'FormExecutions',

  components: {
    SelectFlow,
  },

  emits: ['update:is-valid-form'],

  data() {
    return {
      config: {
        flow: {
          uuid: null,
        },
      },
    };
  },

  computed: {
    ...mapState(useWidgets, ['currentWidgetEditing']),

    widgetConfig() {
      return this.currentWidgetEditing.config;
    },

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
        uuid: this.widgetConfig.flow?.uuid || '',
      },
    };
  },

  methods: {
    ...mapActions(useWidgets, ['updateCurrentWidgetEditingConfig']),
  },
};
</script>
