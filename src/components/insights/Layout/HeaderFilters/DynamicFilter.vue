<template>
  <section class="dynamic-filter">
    <UnnnicLabel
      v-if="filter.label"
      :label="filter.label"
    />
    <component
      :is="currentComponent"
      v-bind="filterProps"
      v-on="filterEvents"
      @update:modelValue="updateModelValue"
    />
  </section>
</template>

<script>
import FilterDate from './FilterDate.vue';
import FilterInputText from './FilterInputText.vue';
import FilterSelect from './FilterSelect.vue';

export default {
  name: 'DynamicFilter',

  props: {
    filter: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  components: {},

  computed: {
    currentComponent() {
      const componentMap = {
        date_range: FilterDate,
        input_text: FilterInputText,
        select: FilterSelect,
      };

      return componentMap[this.filter.type] || null;
    },

    filterProps() {
      const { disabled, treatedModelValue } = this;
      const { type, placeholder, source } = this.filter;

      const defaultProps = {
        placeholder,
        modelValue: treatedModelValue,
        disabled,
      };

      const mappingProps = {
        date_range: {
          modelValue: treatedModelValue,
        },
        input_text: {},
        select: {
          source,
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
      const modelValuesMap = {
        date_range: {
          start: modelValue?.[filter.start_sufix],
          end: modelValue?.[filter.end_sufix],
        },
      };

      return modelValuesMap[filter.type] || modelValue;
    },
  },

  methods: {
    updateModelValue(value) {
      const modelValuesMap = {
        date_range: {
          [this.filter.start_sufix]: value?.start,
          [this.filter.end_sufix]: value?.end,
        },
        select: value?.[0]?.value,
      };

      this.$emit(
        'update:modelValue',
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
