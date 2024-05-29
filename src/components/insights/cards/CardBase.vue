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
  background-color: $unnnic-color-neutral-white;
  box-shadow: $unnnic-shadow-level-far;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  border-radius: $unnnic-border-radius-sm;
}
</style>
