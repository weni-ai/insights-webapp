<template>
  <section class="new-metric">
    <UnnnicIcon
      icon="add_2"
      scheme="bg-active"
    />
  </section>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.new-metric {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: $unnnic-radius-2;
  border: 1px dashed $unnnic-color-border-base;
  cursor: pointer;

  :deep(.unnnic-icon) {
    font-size: 48px;
  }
}
</style>
