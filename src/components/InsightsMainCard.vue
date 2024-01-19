<template>
  <button class="insights-main-card">
    <p class="insights-main-card__description unnnic-font title-sm">
      <slot name="description"></slot>
    </p>
  </button>
</template>

<style scoped lang="scss">
.insights-main-card {
  background-color: $unnnic-color-neutral-soft;
  padding: $unnnic-spacing-sm;
  border-radius: $unnnic-spacing-nano;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;
  justify-content: center;
  text-align: left;
  cursor: pointer;
  border: none;

  &__description {
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }
}
</style>
