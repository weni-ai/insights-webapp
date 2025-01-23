<template>
  <section class="content-recurrence">
    <section>
      <UnnnicLabel :label="$t('drawers.config_recurrence.name_metric')" />
      <UnnnicInput
        v-model="config.name"
        :placeholder="$t('drawers.config_card.name_card.placeholder')"
      />
    </section>

    <SelectFlow
      v-model="config.flow.uuid"
      data-test-id="select-flow"
    />

    <SelectFlowResult
      v-model="config.flow.result"
      data-test-id="select-flow-result"
      :flow="config.flow?.uuid"
      :disabled="!config.flow?.uuid"
    />
    <UnnnicButton
      class="clear-button"
      :text="$t('drawers.reset_widget')"
      type="tertiary"
      :disabled="isDisableResetWidget"
      @click="resetWidget"
    />
  </section>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import SelectFlow from '@/components/SelectFlow.vue';
import SelectFlowResult from '@/components/SelectFlowResult.vue';

export default {
  name: 'DrawerConfigContentRecurrence',

  components: {
    SelectFlow,
    SelectFlowResult,
  },

  emits: ['update:is-valid-form', 'reset-widget'],

  data() {
    return {
      config: null,
    };
  },

  computed: {
    ...mapState({
      widgetConfig: (state) => state.widgets.currentWidgetEditing.config,
      currentWidgetEditing: (state) => state.widgets.currentWidgetEditing,
    }),
    isValidForm() {
      const { config } = this;
      
      return config?.flow.uuid && config?.flow.result && config?.operation && !!config?.name.trim();
    },
    isDisableResetWidget() {
      return false;
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

        if (newConfig?.operation === 'recurrence') this.config.currency = false;
      },
    },

    'config.flow.uuid'(newFlowUuid, oldFlowUuid) {
      if (oldFlowUuid && newFlowUuid !== oldFlowUuid) {
        this.config.flow.result = '';
      }
    },

    isValidForm: {
      immediate: true,
      handler(newIsValidForm) {
        this.$emit('update-disable-primary-button', !newIsValidForm);
      },
    },
  },

  created() {
    const { widgetConfig } = this;
    this.config = {
      name: this.currentWidgetEditing.name || '',
      flow: {
        uuid: widgetConfig.flow?.uuid || '',
        result: widgetConfig.flow?.result || '',
      },
      operation: widgetConfig.operation || '',
      currency: widgetConfig.currency || false,
    };
  },

  methods: {
    ...mapActions({
      updateCurrentWidgetEditingConfig:
        'widgets/updateCurrentWidgetEditingConfig',
    }),
    resetWidget() {
      this.$emit('reset-widget');
    },
  },
};
</script>

<style lang="scss" scoped>
.content-recurrence {
  display: grid;
  gap: $unnnic-spacing-nano;

  .clear-button {
    margin-top: $unnnic-spacing-nano;
  }
}
</style>
