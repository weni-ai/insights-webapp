<template>
  <UnnnicSelectSmart
    :modelValue="treatedModelValue"
    :options="options"
    autocomplete
    autocompleteIconLeft
    autocompleteClearOnFocus
    @update:model-value="$emit('update:model-value', $event[0].value)"
  />
</template>

<script>
import Projects from '@/services/api/resources/projects';
import { compareEquals } from '@/utils/array';

export default {
  name: 'FilterSelect',
  props: {
    modelValue: {
      type: [Object, String],
      default: () => {},
    },
    placeholder: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: '',
    },
    dependsOn: {
      type: Object,
      default: undefined,
    },
    dependsOnValue: {
      type: Object,
      default: null,
    },
    keyValueField: {
      type: String,
      default: '',
    },
  },

  emits: ['update:model-value'],

  data() {
    return {
      options: [
        {
          value: '',
          label: this.placeholder,
        },
      ],
    };
  },

  computed: {
    treatedModelValue() {
      const { modelValue, options } = this;

      if (typeof modelValue === 'string') {
        const modelValueObj =
          options.find((option) => option.value === modelValue) || options[0];

        return [modelValueObj];
      }

      return modelValue || [options[0]];
    },
  },

  watch: {
    dependsOnValue: {
      immediate: true,
      handler(newDependsOnValue, oldDependsOnValue) {
        const newValues = Object.values(newDependsOnValue || {});
        const oldValues = Object.values(oldDependsOnValue || {});
        if (!compareEquals(newValues, oldValues)) {
          const filledDependsOnValue = newValues.every((value) => value);

          if (filledDependsOnValue) {
            this.clearOptions();
            this.fetchSource();
          }
        }
      },
    },
  },

  mounted() {
    if (!this.dependsOn?.search_param) this.fetchSource();
  },

  methods: {
    async fetchSource() {
      try {
        const response = await Projects.getProjectSource(
          this.source,
          this.dependsOnValue || {},
        );
        response?.forEach((source) => {
          this.options.push({
            value: source[this.keyValueField] || source.uuid,
            label: source.name,
          });
        });
      } catch (e) {
        console.error('getProjectSource error', e);
      }
    },
    clearOptions() {
      const optionsPlaceholder = this.options[0];
      this.options = [optionsPlaceholder];
    },
  },
};
</script>
