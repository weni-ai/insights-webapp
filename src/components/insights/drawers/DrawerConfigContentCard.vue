<template>
  <section>
    <UnnnicLabel :label="$t('drawers.config_card.name_card.label')" />
    <UnnnicInput
      v-model="config.name"
      :placeholder="$t('drawers.config_card.name_card.placeholder')"
    />
  </section>

  <component
    :is="currentFormComponent"
    v-on="currentFormEvents"
  />

  <UnnnicButton
    :text="$t('drawers.reset_widget')"
    type="tertiary"
    :disabled="disableResetWidgetButton"
    @click="$emit('reset-widget')"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { checkDeepEmptyValues } from '@/utils/object';

import FormExecutions from './DrawerForms/Card/FormExecutions.vue';
import FormFlowResult from './DrawerForms/Card/FormFlowResult.vue';

export default {
  name: 'DrawerConfigContentCard',

  props: {
    type: {
      type: String,
      default: '',
      validate(value) {
        return ['executions', 'flow_result'].includes(value);
      },
    },
  },

  emits: ['update-disable-primary-button', 'reset-widget'],

  data() {
    return {
      initialConfigStringfy: '',
      config: null,
      isCurrentFormValid: false,
    };
  },

  computed: {
    ...mapState({
      widgetConfig: (state) => state.widgets.currentWidgetEditing.config,
    }),

    currentFormComponent() {
      const componentMap = {
        executions: FormExecutions,
        flow_result: FormFlowResult,
      };

      return componentMap[this.type] || null;
    },

    currentFormEvents() {
      const defaultEvents = {
        'update:is-valid-form': (isValid) =>
          (this.isCurrentFormValid = !!isValid),
      };

      const mappingEvents = {};

      return { ...defaultEvents, ...mappingEvents[this.type] };
    },

    isAllFieldsValid() {
      return this.config?.name && this.isCurrentFormValid;
    },

    disableResetWidgetButton() {
      return checkDeepEmptyValues(this.widgetConfig);
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

    widgetConfig: {
      deep: true,
      handler() {
        this.updatePrimaryButtonState();
      },
    },

    isAllFieldsValid() {
      this.updatePrimaryButtonState();
    },
  },

  created() {
    this.config = { ...this.widgetConfig, type_result: this.type };
    this.initializeConfigString();
  },

  methods: {
    ...mapActions({
      updateCurrentWidgetEditingConfig:
        'widgets/updateCurrentWidgetEditingConfig',
    }),

    initializeConfigString() {
      if (this.config && !this.initialConfigStringfy) {
        this.initialConfigStringfy = JSON.stringify(this.widgetConfig);
      }
    },
    updatePrimaryButtonState() {
      const disablePrimaryButton =
        this.initialConfigStringfy === JSON.stringify(this.widgetConfig) ||
        !this.isAllFieldsValid;

      this.$emit('update-disable-primary-button', disablePrimaryButton);
    },
  },
};
</script>
