<template>
  <component
    :is="currentComponent"
    v-bind="filterProps"
    v-on="filterEvents"
    @update:modelValue="$emit('update:modelValue', $event)"
  />
</template>

<script>
import moment from 'moment';
import FilterDate from './FilterDate.vue';

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
  },

  components: {},

  computed: {
    currentComponent() {
      const componentMap = {
        date_range: FilterDate,
        select: null, // TODO: Create FilterSelect component
        input_text: null, // TODO: Create FilterInputText component
      };

      return componentMap[this.filter.type] || null;
    },

    filterProps() {
      const { type } = this.filter;
      const mappingProps = {
        date_range: {
          modelValue: this.modelValue || {
            start: moment().subtract(1, 'day').format('YYYY-MM-DD'),
            end: moment().format('YYYY-MM-DD'),
          },
        },
      };

      return mappingProps[type];
    },

    filterEvents() {
      const { type } = this.filter;
      const mappingEvents = {};

      return mappingEvents[type];
    },
  },
};
</script>
