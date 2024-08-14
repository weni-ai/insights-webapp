<template>
  <ol>
    <UnnnicLabel
      v-if="label"
      :label="label"
      data-testid="checkbox-list-label"
    />
    <section :class="['checkbox-list']">
      <template
        v-for="(checkbox, index) in checkboxes"
        :key="checkbox.value"
      >
        <li class="checkbox-list__checkbox">
          <UnnnicCheckbox
            :modelValue="checkbox.selected"
            :textRight="checkbox.label"
            :disabled="checkbox.disabled"
            data-testid="checkbox"
            @change="updateCheckboxSelected({ selected: $event, index })"
          />
        </li>
      </template>
    </section>
  </ol>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface Checkbox {
  value: string;
  label: string;
  disabled?: boolean;
  selected: boolean;
}

export default defineComponent({
  name: 'CheckboxList',

  props: {
    checkboxes: {
      type: Array as () => Checkbox[],
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
  },

  emits: ['update:checkboxes'],

  methods: {
    updateCheckboxSelected({ selected, index }) {
      const newCheckboxes = this.checkboxes;
      newCheckboxes[index].selected = selected;
      this.$emit('update:checkboxes', newCheckboxes);
    },
  },
});
</script>

<style lang="scss" scoped>
.checkbox-list {
  display: flex;
  flex-wrap: wrap;
  row-gap: $unnnic-spacing-nano;
}
</style>
