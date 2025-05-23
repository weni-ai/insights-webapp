<template>
  <SubWidget
    v-for="(subwidget, index) of subwidgets"
    :key="subwidget.title"
    :title="subwidget.title"
    :config="subwidget.config"
    :active="activeSubwidget === index"
    @update:config="updateSubwidget(index + 1, $event)"
    @update:active="updateActiveSubwidget(index, $event)"
    @is-valid-form="updateSubwigetValid(index, $event)"
  />

  <RadioList
    v-model:selectedRadio="config.operation"
    :label="$t('drawers.config_card.operation')"
    :radios="operations"
  />

  <CheckboxList
    :label="$t('drawers.config_card.format')"
    :checkboxes="formatations"
    @update:checkboxes="updateFormatations"
  />
</template>
<script>
import { mapActions, mapState } from 'pinia';

import { useWidgets } from '@/store/modules/widgets';

import RadioList from '@/components/RadioList.vue';
import CheckboxList from '@/components/CheckboxList.vue';
import SubWidget from './SubWidget.vue';

export default {
  name: 'FormDataCrossing',

  components: {
    SubWidget,
    RadioList,
    CheckboxList,
  },

  emits: ['update:is-valid-form'],

  data() {
    return {
      config: null,

      subwidgets: null,
      activeSubwidget: null,
      isSubwidgetsValids: {
        subwidget_1: false,
        subwidget_2: false,
      },

      operations: [
        {
          value: 'multiply',
          label: this.$t('drawers.config_card.radios.multiply'),
        },
        {
          value: 'sum',
          label: this.$t('drawers.config_card.radios.sum'),
        },
        {
          value: 'sub',
          label: this.$t('drawers.config_card.radios.difference'),
        },
        {
          value: 'percentage',
          label: this.$t('drawers.config_card.radios.percentage'),
        },
      ],
    };
  },

  computed: {
    ...mapState(useWidgets, ['currentWidgetEditing']),

    widgetConfig() {
      return this.currentWidgetEditing.config;
    },

    formatations() {
      return [
        {
          value: 'currency',
          selected: this.config?.currency,
          label: this.$t('drawers.config_card.checkbox.currency'),
          disabled: this.config?.operation === 'percentage',
        },
      ];
    },

    isValidForm() {
      const { config } = this;

      return !!(
        Object.values(this.isSubwidgetsValids).every(
          (subwiget) => !!subwiget,
        ) && config?.operation
      );
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

        if (newConfig?.operation === 'percentage') this.config.currency = false;
      },
    },

    'config?.flow.uuid'(_newFlow, oldFlow) {
      if (typeof oldFlow === 'object') {
        this.config.flow.result = '';
      }
    },

    isValidForm: {
      immediate: true,
      handler(newIsValidForm) {
        this.$emit('update:is-valid-form', newIsValidForm);
      },
    },
  },

  created() {
    this.handleConfig();
  },

  mounted() {
    this.$nextTick().then(() => {
      this.activeSubwidget = 0;
    });
  },

  methods: {
    ...mapActions(useWidgets, ['updateCurrentWidgetEditingConfig']),

    handleConfig() {
      const { widgetConfig } = this;

      const createFlowConfig = (flowConfig) => ({
        uuid: flowConfig?.uuid || '',
        result: flowConfig?.result || '',
      });

      const createSubwidgetConfig = (subwidgetConfig) => ({
        result_type: subwidgetConfig?.result_type || 'executions',
        operation: subwidgetConfig?.operation || 'avg',
        flow: {
          ...createFlowConfig(subwidgetConfig?.flow),
          result_correspondence: subwidgetConfig?.result_correspondence || '',
        },
      });

      this.config = {
        subwidget_1: createSubwidgetConfig(widgetConfig.subwidget_1),
        subwidget_2: createSubwidgetConfig(widgetConfig.subwidget_2),
        operation: widgetConfig.operation || 'percentage',
        currency: widgetConfig.currency || false,
      };

      this.subwidgets = [
        {
          title: this.$t('drawers.config_card.first_value'),
          config: this.config.subwidget_1,
        },
        {
          title: this.$t('drawers.config_card.second_value'),
          config: this.config.subwidget_2,
        },
      ];
    },

    updateSubwidget(id, value) {
      this.config[`subwidget_${id}`] = value;
    },

    updateActiveSubwidget(index, isActive) {
      if (isActive) {
        this.activeSubwidget = index;
      }
      if (this.activeSubwidget === index && !isActive) {
        this.activeSubwidget = null;
      }
    },

    updateSubwigetValid(index, isValid) {
      this.isSubwidgetsValids[`subwidget_${index + 1}`] = isValid;
    },

    updateFormatations(newFormatations) {
      newFormatations.forEach((formatation) => {
        this.config[formatation.value] = formatation.selected;
      });
    },
  },
};
</script>
