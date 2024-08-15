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

<script lang="ts">
import { defineComponent } from 'vue';

interface Radio {
  value: string;
  label: string;
  tooltip?: string;
}

export default defineComponent({
  name: 'RadioList',

  props: {
    radios: {
      type: Array as () => Radio[],
      required: true,
    },
    selectedRadio: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    wrap: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['update:selected-radio'],
});
</script>

<style lang="scss" scoped>
.radio-list {
  display: flex;
  flex-wrap: wrap;
  row-gap: $unnnic-spacing-nano;

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
