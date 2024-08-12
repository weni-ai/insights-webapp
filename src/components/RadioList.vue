<template>
  <section>
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
        <UnnnicRadio
          :data-testid="`radio-${radio.value}`"
          :modelValue="radio.value"
          :value="selectedRadio"
          @update:model-value="$emit('update:selected-radio', radio.value)"
        >
          {{ radio.label }}
        </UnnnicRadio>
      </template>
    </section>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface Radio {
  value: string;
  label: string;
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

  .unnnic-radio-container {
    width: 100%;
  }

  &--wrap-radios {
    .unnnic-radio-container {
      width: 50%;
    }
  }
}
</style>
