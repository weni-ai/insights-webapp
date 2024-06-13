<template>
  <UnnnicSelectSmart
    :modelValue="treatedModelValue"
    :options="options"
    autocomplete
    autocompleteIconLeft
    autocompleteClearOnFocus
    @update:model-value="$emit('update:modelValue', $event[0].value)"
  />
</template>

<script>
import Projects from '@/services/api/resources/projects';

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
      type: Object || undefined,
      default: undefined,
    },
    dependsOnValue: {
      type: Object,
      default: null,
    },
  },

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
      handler() {
        this.fetchSource();
      },
      deep: true,
    },
  },

  mounted() {
    if (!this.dependsOn?.search_param) this.fetchSource();
  },

  methods: {
    async fetchSource() {
      const response = await Projects.getProjectSource(
        this.source,
        this.dependsOnValue || {},
      );
      response?.forEach((source) => {
        this.options.push({ value: source.uuid, label: source.name });
      });
    },
  },
};
</script>
