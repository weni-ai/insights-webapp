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
    :data-testid="`form-${type}`"
    v-on="currentFormEvents"
  />

  <SelectEmojiButton
    v-model="config.friendly_id"
    :pickerPosition="type === 'executions' ? 'bottom' : 'top'"
  />

  <UnnnicButton
    :text="$t('drawers.reset_widget')"
    type="tertiary"
    :disabled="disableResetWidgetButton"
    data-testid="reset-widget-button"
    @click="$emit('reset-widget')"
  />
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useWidgets } from '@/store/modules/widgets';

import FormExecutions from './DrawerForms/Card/FormExecutions.vue';
import FormFlowResult from './DrawerForms/Card/FormFlowResult.vue';
import FormDataCrossing from './DrawerForms/Card/FormDataCrossing/index.vue';
import SelectEmojiButton from '@/components/SelectEmojiButton.vue';

import { checkDeepEmptyValues } from '@/utils/object';

export default {
  name: 'DrawerConfigContentCard',

  components: {
    SelectEmojiButton,
  },

  props: {
    type: {
      type: String,
      default: '',
      validate(value) {
        return ['executions', 'flow_result', 'data_crossing'].includes(value);
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
    ...mapState(useWidgets, ['currentWidgetEditing']),

    widgetConfig() {
      return this.currentWidgetEditing.config;
    },

    currentFormComponent() {
      const componentMap = {
        executions: FormExecutions,
        flow_result: FormFlowResult,
        data_crossing: FormDataCrossing,
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
    this.config = {
      ...this.widgetConfig,
      type: this.type,
      friendly_id: this.widgetConfig.friendly_id || '',
    };
    this.initializeConfigString();
  },

  methods: {
    ...mapActions(useWidgets, ['updateCurrentWidgetEditingConfig']),

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
