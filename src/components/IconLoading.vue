<template>
  <UnnnicIconLoading
    class="icon-loading"
    data-testid="icon-loading"
  />
</template>

<script setup lang="ts">
defineOptions({ name: 'IconLoading' });
</script>

<style lang="scss" scoped>
.unnnic-icon-loading.icon-loading {
  font-size: $unnnic-font-size * 3;
  color: $unnnic-color-gray-5;
}
</style>
