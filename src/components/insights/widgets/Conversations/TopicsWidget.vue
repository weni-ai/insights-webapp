<template>
  <section class="topics-widget">
    <p class="topics-widget-title">Assuntos</p>
    <section class="topics-widget__content"></section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isLoading = ref(false);
</script>

<style lang="scss" scoped>
.topics-widget {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
  width: 100%;
  height: 100%;

  &-title {
    font-size: $unnnic-font-size-title-md;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-dark;
  }

  &__content {
    width: 100%;
    height: 100%;
    background-color: $unnnic-color-neutral-light;
    min-height: 600px;
  }
}
</style>
