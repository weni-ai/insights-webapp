<template>
  <article class="insights-card">
    <p class="insights-card__title">
      <slot name="title"></slot>
    </p>
    <p class="insights-card__description">
      <slot name="description"></slot>
    </p>
  </article>
</template>

<script>
export default {
  name: 'SugestionCard',
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
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
  }

  &__description {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-gt;
    font-family: $unnnic-font-family-secondary;
    position: relative;
    white-space: nowrap;
    width: 22em;
    overflow: hidden;
    text-overflow: ellipsis;

    &::before {
      content: '';
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
