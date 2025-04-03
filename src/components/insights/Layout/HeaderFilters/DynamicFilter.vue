<template>
  <section class="dynamic-filter">
    <UnnnicLabel
      v-if="filter.label"
      :label="filter.label ? $t(filter.label) : ''"
    />
    <component
      :is="currentComponent"
      v-bind="filterProps"
      v-on="filterEvents"
      @update:model-value="updateModelValue"
    />
  </section>
</template>

<script>
import FilterDate from './FilterDate.vue';
import FilterInputText from './FilterInputText.vue';
import FilterSelect from './FilterSelect.vue';
import FilterSelectDate from './FilterSelectDate.vue';
import { findMatchingDate } from '@/utils/time';
import i18n from '@/utils/plugins/i18n';
import moment from 'moment';

export default {
  name: 'DynamicFilter',

  props: {
    modelValue: {
      type: [Object, String],
      default: null,
    },
    filter: {
      type: Object,
      default: () => ({}),
    },
    dependsOnValue: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:model-value'],

  computed: {
    currentComponent() {
      const componentMap = {
        select_date_range: FilterSelectDate,
        date_range: FilterDate,
        input_text: FilterInputText,
        select: FilterSelect,
      };

      return componentMap[this.filter.type] || null;
    },

    filterProps() {
      const { disabled, treatedModelValue } = this;

      const {
        type,
        placeholder,
        source,
        depends_on,
        key_value_field,
        next,
        minDate,
        shortCutOptions,
        disableClear,
      } = this.filter;

      const defaultProps = {
        placeholder: placeholder ? this.$t(placeholder) : '',
        modelValue: treatedModelValue,
        disabled,
        dependsOn: depends_on,
        dependsOnValue: this.dependsOnValue,
      };

      const treatedModelValueWithLabel =
        treatedModelValue && treatedModelValue.start
          ? findMatchingDate(treatedModelValue, i18n.global.t)
          : {
              label: '-',
              value: {
                start: '',
                end: '',
              },
            };

      const mappingProps = {
        select_date_range: {
          modelValue: treatedModelValueWithLabel,
        },
        date_range: {
          modelValue: treatedModelValue,
          maxDate: moment().format('YYYY-MM-DD'),
          minDate,
          next,
          options: shortCutOptions,
          disableClear,
        },
        input_text: {},
        select: {
          source,
          keyValueField: key_value_field,
        },
      };

      return { ...defaultProps, ...mappingProps[type] };
    },

    filterEvents() {
      const { type } = this.filter;
      const mappingEvents = {};

      return mappingEvents[type] || {};
    },

    treatedModelValue() {
      const { modelValue, filter } = this;

      const dateModel = {
        start: modelValue?.[filter.start_sufix],
        end: modelValue?.[filter.end_sufix],
      };

      const modelValuesMap = {
        date_range: dateModel,
        select_date_range: dateModel,
      };

      return modelValuesMap[filter.type] || modelValue;
    },
  },

  methods: {
    updateModelValue(value) {
      const dateModel = {
        [this.filter.start_sufix]: value?.start,
        [this.filter.end_sufix]: value?.end,
      };

      const modelValuesMap = {
        select_date_range: dateModel,
        date_range: dateModel,
        select: value?.[0]?.value,
      };

      this.$emit(
        'update:model-value',
        modelValuesMap[this.filter.type] || value,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.dynamic-filter {
  display: flex;
  flex-direction: column;

  :deep(.unnnic-label__label),
  :deep(.unnnic-form__label) {
    margin: 0 0 $unnnic-spacing-nano;
  }
}
</style>
