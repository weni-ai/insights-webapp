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

<script setup lang="ts">
defineOptions({ name: 'CheckboxList' });

interface Checkbox {
  value: string;
  label: string;
  disabled?: boolean;
  selected: boolean;
}

interface CheckboxListProps {
  checkboxes: Checkbox[];
  label?: string;
}

const props = withDefaults(defineProps<CheckboxListProps>(), {
  label: '',
});

const emit = defineEmits<{
  'update:checkboxes': [checkboxes: Checkbox[]];
}>();

const updateCheckboxSelected = ({
  selected,
  index,
}: {
  selected: boolean;
  index: number;
}) => {
  const newCheckboxes = props.checkboxes;
  newCheckboxes[index].selected = selected;
  emit('update:checkboxes', newCheckboxes);
};
</script>

<style lang="scss" scoped>
.checkbox-list {
  display: flex;
  flex-wrap: wrap;
  row-gap: $unnnic-space-1;
}
</style>
