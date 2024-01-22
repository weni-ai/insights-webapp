<template>
  <button class="dashboards-card">
    <div class="dashboards-card__background"></div>
    <p class="dashboards-card__title unnnic-font body-lg bold">
      <slot name="title"></slot>
    </p>
    <unnnic-button
      text="Ver"
      type="secondary"
      size="large"
      class="dashboards-card__button"
    />
  </button>
</template>

<style lang="scss" scoped>
.dashboards-card {
  background-color: $unnnic-color-neutral-white;
  padding: $unnnic-spacing-sm;
  border-radius: $unnnic-spacing-nano;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;
  justify-content: center;
  cursor: pointer;
  border: 1px solid $unnnic-color-neutral-cleanest;
  border-radius: $unnnic-border-radius-md;
  &__background {
    border-radius: $unnnic-border-radius-sm;
    height: 100px;
    background-color: $unnnic-color-weni-50;
    width: 374.67px;
  }
  &__button {
    width: 100%;
  }
}
</style>
