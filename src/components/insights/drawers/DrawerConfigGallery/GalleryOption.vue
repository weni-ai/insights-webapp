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
  padding: $unnnic-space-6;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: $unnnic-space-1;

  width: 100%;

  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-gray-2;
  background-color: $unnnic-color-gray-0;

  cursor: pointer;

  font-family: $unnnic-font-family;

  &:hover {
    border-color: $unnnic-color-teal-7;
    background-color: $unnnic-color-teal-1;
  }

  &__title {
    color: $unnnic-color-gray-12;
    font: $unnnic-font-display-3;
  }
  &__description {
    color: $unnnic-color-gray-7;
    font: $unnnic-font-body;
    text-align: start;
  }
}
</style>
