<template>
  <UnnnicIconLoading
    class="icon-loading"
    data-testid="icon-loading"
  />
</template>

<script>
export default {
  name: 'IconLoading',
};
</script>

<style lang="scss" scoped>
.unnnic-icon-loading.icon-loading {
  font-size: $unnnic-font-size * 3;
  color: $unnnic-color-gray-5;
}
</style>
