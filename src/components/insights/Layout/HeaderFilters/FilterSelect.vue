<template>
  <UnnnicSelectSmart
    :modelValue="treatedModelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
    :options="options"
    autocomplete
    autocompleteIconLeft
    autocompleteClearOnFocus
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

  created() {
    this.fetchSource();
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

  methods: {
    async fetchSource() {
      const response = await Projects.getProjectSource(this.source);
      response?.forEach((source) => {
        this.options.push({ value: source.uuid, label: source.name });
      });
    },
  },
};
</script>
