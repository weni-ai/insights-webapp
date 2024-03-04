<template>
  <button class="insights-card">
    <p class="insights-card__title unnnic-font body-lg bold">
      <slot name="title"></slot>
    </p>
    <p class="insights-card__description unnnic-font body-gt">
      <slot name="description"></slot>
    </p>
  </button>
</template>

<script>
export default {
  name: 'InsightsCard',
};
</script>

<style scoped lang="scss">
.insights-card {
  background-color: $unnnic-color-neutral-lightest;
  padding: $unnnic-spacing-sm;
  border-radius: $unnnic-spacing-nano;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;
  justify-content: center;
  cursor: pointer;
  border: none;
  text-align: left;

  &__title {
    color: $unnnic-color-neutral-darkest;
  }

  &__description {
    color: $unnnic-color-neutral-dark;
  }
}
</style>
