<template>
  <div class="layout_selector">
    <button
      v-for="(layout, index) in layouts"
      :key="index"
      :class="[
        'layout_button',
        { 'layout_button-active': selectedLayout === layout },
      ]"
      @click="selectLayout(layout)"
    >
      <section
        :class="[
          'layout_button_container',
          { 'layout_button_container-active': selectedLayout === layout },
        ]"
      >
        <DynamicGrid
          :numberCards="layout"
          :active="selectedLayout === layout"
        />
      </section>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
import DynamicGrid from './DynamicGrid.vue';

const emit = defineEmits(['layoutSelected']);

const layouts = [1, 2, 3, 0];

const selectedLayout = ref(1);

function selectLayout(layout: number) {
  selectedLayout.value = layout;

  emit('layoutSelected', layout);
}
</script>

<style scoped lang="scss">
.layout_selector {
  display: flex;
  gap: $unnnic-spacing-sm;
}

.layout_button {
  width: 79.75px;
  height: 49px;
  cursor: pointer;
  border-radius: $unnnic-spacing-nano;
  padding: $unnnic-spacing-nano;
  border: 1px solid $unnnic-color-neutral-light;
  background-color: $unnnic-color-background-white;

  &:hover {
    border-color: $unnnic-color-neutral-soft;
  }

  &_container {
    background-color: white;
    padding: $unnnic-spacing-nano 0.1875rem;
    border: 1.5px solid $unnnic-color-neutral-cleanest;
    border-radius: 0.0625rem;
    width: 100%;
    height: 100%;

    &-active {
      border-color: $unnnic-color-weni-600;
      background-color: $unnnic-color-weni-50;
    }
  }

  &-active {
    background-color: $unnnic-color-weni-50;
    border-color: $unnnic-color-neutral-soft;
  }
}
</style>
