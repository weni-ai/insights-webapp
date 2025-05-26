<template>
  <button class="gallery-option">
    <p
      class="gallery-option__title"
      data-testid="galery-option-title"
    >
      {{ title }}
    </p>
    <p
      class="gallery-option__description"
      data-testid="galery-option-description"
    >
      {{ description }}
    </p>
  </button>
</template>

<script>
export default {
  name: 'GalleryOption',

  props: {
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.gallery-option {
  display: flex;
  padding: $unnnic-spacing-md;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: $unnnic-spacing-nano;

  width: 100%;

  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  background-color: $unnnic-color-neutral-snow;

  cursor: pointer;

  font-family: $unnnic-font-family-secondary;

  &:hover {
    border-color: $unnnic-color-weni-500;
    background-color: $unnnic-color-weni-50;
  }

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-line-height-small * 6;
  }
  &__description {
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-gt;
    line-height: $unnnic-line-height-small * 5.5;
    text-align: justify;
  }
}
</style>
