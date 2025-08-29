<template>
  <UnnnicSelectSmart
    data-testid="unnnic-multi-select"
    :modelValue="treatedModelValue"
    :options="optionsWithAll"
    multiple
    autocomplete
    autocompleteIconLeft
    autocompleteClearOnFocus
    :orderedByIndex="allLabel ? true : false"
    @update:model-value="updateModelValue"
  />
</template>

<script>
import { mapActions } from 'pinia';

import { useSectors } from '@/store/modules/sectors';

import Projects from '@/services/api/resources/projects';

import { compareEquals } from '@/utils/array';

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
    allLabel: {
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

    optionsWithAll() {
      const baseOptions = [...this.options];

      if (this.allLabel) {
        const allOption = {
          value: '__all__',
          label: this.allLabel,
        };

        return [allOption, ...baseOptions];
      }

      return baseOptions;
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
    ...mapActions(useSectors, ['updateSectors']),
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
      if (this.allLabel && value && Array.isArray(value)) {
        const hasAllSelected = value.some((item) => item.value === '__all__');
        const hasOthersSelected = value.some(
          (item) => item.value !== '__all__' && item.value !== '',
        );

        if (hasAllSelected && hasOthersSelected) {
          const allOption = value.find((item) => item.value === '__all__');
          this.$emit('update:model-value', [allOption]);
          return;
        }

        if (
          hasOthersSelected &&
          this.modelValue &&
          Array.isArray(this.modelValue)
        ) {
          const wasAllSelected = this.modelValue.some(
            (item) => item.value === '__all__',
          );
          if (wasAllSelected) {
            const filteredValue = value.filter(
              (item) => item.value !== '__all__' && item.value !== '',
            );
            this.$emit('update:model-value', filteredValue);
            return;
          }
        }
      }

      this.$emit('update:model-value', value);
    },
  },
};
</script>
