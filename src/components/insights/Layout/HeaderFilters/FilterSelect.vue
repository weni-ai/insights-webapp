<template>
  <UnnnicSelect
    :modelValue="modelValue"
    :options="options"
    :placeholder="placeholder"
    itemLabel="label"
    itemValue="value"
    @update:model-value="$emit('update:model-value', $event)"
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
    fetchRequest: {
      type: Function,
      default: (...params) => {
        return Projects.getProjectSource(...params);
      },
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
        const response = await this.fetchRequest(
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

<style lang="scss">
.unnnic-popover {
  background-color: $unnnic-color-background-snow;
}
</style>
