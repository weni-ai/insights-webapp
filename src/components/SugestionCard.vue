<template>
  <article
    data-testid="sugestion-card"
    class="insights-card"
  >
    <p
      data-testid="sugestion-card-title"
      class="insights-card__title"
    >
      <slot name="title"></slot>
    </p>
    <p
      data-testid="sugestion-card-description"
      class="insights-card__description"
    >
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
  background-color: $unnnic-color-gray-1;
  padding: $unnnic-space-4;
  border-radius: $unnnic-space-1;
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;
  justify-content: center;
  cursor: pointer;
  border: none;
  text-align: left;

  &__title {
    color: $unnnic-color-gray-12;
    font-size: $unnnic-font-size;
    font-weight: $unnnic-font-weight-bold;
  }

  &__description {
    color: $unnnic-color-gray-10;
    font-size: 14px;
    font-family: $unnnic-font-family;
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
