<template>
  <UnnnicSelectSmart
    :modelValue="treatedModelValue"
    :options="options"
    multiple
    autocomplete
    autocompleteIconLeft
    autocompleteClearOnFocus
    @update:model-value="updateModelValue"
  />
</template>

<script>
import Projects from '@/services/api/resources/projects';
import { compareEquals } from '@/utils/array';
import { mapActions } from 'vuex';

export default {
  name: 'FilterMultiSelect',
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
      type: [Object, undefined],
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
      const { modelValue } = this;

      return modelValue || [];
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
    ...mapActions({
      updateSectors: 'sectors/updateSectors',
    }),
    async fetchSource() {
      try {
        const response = await Projects.getProjectSource(
          this.source,
          this.dependsOnValue || {},
        );

        if (this.source === 'sectors') {
          this.updateSectors(response);
        }

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
    updateModelValue(value) {
      this.$emit('update:model-value', value);
    },
  },
};
</script>
