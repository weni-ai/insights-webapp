<template>
  <SubWidget
    v-for="(subwidget, index) of subwidgets"
    :key="subwidget.title"
    :modelValue="subwidget"
    @update:model-value="updateSubwidget(index + 1, $event)"
    @update:active="updateActiveSubwidget(index, $event)"
  />

  <RadioList
    v-model:selected-radio="config.operation"
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
import { mapActions, mapState } from 'vuex';

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

      subwidgets: [
        {
          title: this.$t('drawers.config_card.first_value'),
          result_type: '',
          operation: '',
          flow: {
            uuid: '',
            result: '',
            result_correspondence: '',
          },
          active: true,
        },
        {
          title: this.$t('drawers.config_card.second_value'),
          result_type: '',
          operation: '',
          flow: {
            uuid: '',
            result: '',
            result_correspondence: '',
          },
          active: false,
        },
      ],
      activeSubwidget: null,

      operations: [
        {
          value: 'sum',
          label: this.$t('drawers.config_card.radios.multiply'),
        },
        {
          value: 'max',
          label: this.$t('drawers.config_card.radios.sum'),
        },
        {
          value: 'avg',
          label: this.$t('drawers.config_card.radios.difference'),
        },
        {
          value: 'min',
          label: this.$t('drawers.config_card.radios.percentage'),
        },
      ],
    };
  },

  computed: {
    ...mapState({
      widgetConfig: (state) => state.widgets.currentWidgetEditing.config,
    }),

    formatations() {
      return [
        {
          value: 'currency',
          selected: this.config?.currency,
          label: this.$t('drawers.config_card.checkbox.currency'),
        },
      ];
    },

    isValidForm() {
      const { config } = this;

      return config?.flow?.uuid && config?.flow?.result && config?.operation;
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

    'config?.flow.uuid'(_newFlow, oldFlow) {
      if (typeof oldFlow === 'object') {
        this.config.flow.result = '';
      }
    },

    'config?.operation'(newOperation) {
      if (newOperation === 'recurrence') this.config.currency = false;
    },

    isValidForm: {
      immediate: true,
      handler(newIsValidForm) {
        this.$emit('update:is-valid-form', newIsValidForm);
      },
    },
  },

  created() {
    const { widgetConfig } = this;

    const createFlowConfig = (flowConfig) => ({
      uuid: flowConfig?.uuid || '',
      result: flowConfig?.result || '',
    });

    const createSubwidgetConfig = (subwidgetConfig) => ({
      result_type: subwidgetConfig?.type_result || '',
      operation: subwidgetConfig?.operator || '',
      flow: {
        ...createFlowConfig(subwidgetConfig?.flow || {}),
        result_correspondence: subwidgetConfig?.result_correspondence || '',
      },
    });

    this.config = {
      flow: createFlowConfig(widgetConfig.flow || {}),
      operation: widgetConfig.operation || '',
      currency: widgetConfig.currency || false,
      subwidget_1: createSubwidgetConfig(widgetConfig.subwidget_1 || {}),
      subwidget_2: createSubwidgetConfig(widgetConfig.subwidget_2 || {}),
    };
  },

  methods: {
    ...mapActions({
      updateCurrentWidgetEditingConfig:
        'widgets/updateCurrentWidgetEditingConfig',
    }),

    updateSubwidget(id, value) {
      this.config[`subwidget_${id}`] = value;
    },

    updateActiveSubwidget(index, isActive) {
      this.subwidgets[index].active = isActive;
      if (isActive) {
        this.activeSubwidget = index;
      }
      if (this.activeSubwidget === index && !isActive) {
        this.activeSubwidget = null;
      }
    },

    updateFormatations(newFormatations) {
      newFormatations.forEach((formatation) => {
        this.config[formatation.value] = formatation.selected;
      });
    },
  },
};
</script>
