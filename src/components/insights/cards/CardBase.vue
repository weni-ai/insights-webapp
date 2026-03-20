<template>
  <section class="card-base">
    <slot />
  </section>
</template>

<script>
export default {
  name: 'CardBase',
};
</script>

<style lang="scss" scoped>
.card-base {
  background-color: $unnnic-color-gray-0;
  box-shadow: $unnnic-shadow-2;
  border: 1px solid $unnnic-color-gray-2;
  border-radius: $unnnic-radius-1;
}
</style>
