<template>
  <div class="layout_selector">
    <button
      v-for="(layout, index) in layouts"
      :key="index"
      :class="[
        'layout_button',
        { 'layout_button-active': selectedLayout === layout },
      ]"
      :data-test-id="`layout_button-${index}`"
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
  gap: $unnnic-space-4;
}

.layout_button {
  width: 100%;
  max-width: 118px;
  aspect-ratio: 1.6;
  cursor: pointer;
  border-radius: $unnnic-space-1;
  padding: $unnnic-space-1;
  border: 1px solid $unnnic-color-gray-1;
  background-color: $unnnic-color-gray-0;

  &:hover {
    border-color: $unnnic-color-gray-2;
    box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.1);
  }

  &_container {
    background-color: white;
    padding: $unnnic-space-1 0.1875rem;
    border: 1.5px solid $unnnic-color-gray-4;
    border-radius: 0.0625rem;
    width: 100%;
    height: 100%;

    &-active {
      border-color: $unnnic-color-teal-8;
      background-color: $unnnic-color-teal-1;
    }
  }

  &-active {
    background-color: $unnnic-color-teal-1;
    border-color: $unnnic-color-gray-2;
    box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.1);
  }
}
</style>
