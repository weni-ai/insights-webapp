<template>
  <ol>
    <UnnnicLabel
      v-if="label"
      :label="label"
      data-testid="radio-list-label"
    />
    <section :class="['radio-list', { 'radio-list--wrap-radios': wrap }]">
      <template
        v-for="radio in radios"
        :key="radio.value"
      >
        <li class="radio-list__radio">
          <UnnnicRadio
            :data-testid="`radio-${radio.value}`"
            :modelValue="radio.value"
            :value="selectedRadio"
            @update:model-value="$emit('update:selected-radio', radio.value)"
          >
            {{ radio.label }}
          </UnnnicRadio>
          <UnnnicToolTip
            v-if="radio.tooltip"
            :data-testid="`radio-${radio.value}-tooltip`"
            :text="radio.tooltip"
            side="top"
            enabled
          >
            <UnnnicIcon
              icon="info"
              scheme="neutral-dark"
              size="sm"
            />
          </UnnnicToolTip>
        </li>
      </template>
    </section>
  </ol>
</template>

<script setup lang="ts">
defineOptions({ name: 'RadioList' });

interface Radio {
  value: string;
  label: string;
  tooltip?: string;
}

interface RadioListProps {
  radios: Radio[];
  selectedRadio?: string;
  label?: string;
  wrap?: boolean;
}

withDefaults(defineProps<RadioListProps>(), {
  selectedRadio: '',
  label: '',
  wrap: true,
});

defineEmits<{
  'update:selected-radio': [value: string];
}>();
</script>

<style lang="scss" scoped>
.radio-list {
  display: flex;
  flex-wrap: wrap;
  row-gap: $unnnic-space-1;

  &__radio {
    width: 100%;

    display: flex;
    align-items: center;

    .radio__tooltip {
      display: flex;
    }
  }

  &--wrap-radios {
    .radio-list__radio {
      width: 50%;
    }
  }
}
</style>
