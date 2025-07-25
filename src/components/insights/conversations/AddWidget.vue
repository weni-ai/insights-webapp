<template>
  <section
    class="add-widget"
    data-testid="add-widget"
  >
    <h2
      class="add-widget__title"
      data-testid="add-widget-title"
    >
      {{ title }}
    </h2>
    <p
      class="add-widget__description"
      data-testid="add-widget-description"
    >
      {{ description }}
    </p>
    <UnnnicButton
      data-testid="add-widget-button"
      :text="actionText"
      iconLeft="add"
      size="small"
      type="primary"
      @click="emit('action')"
    />
  </section>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (_e: 'action'): void;
}>();

defineProps<{
  title: string;
  description: string;
  actionText: string;
}>();
</script>

<style scoped lang="scss">
.add-widget {
  position: absolute;
  top: 0;
  right: 0;

  padding: $unnnic-spacing-nano 0;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-ant;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner dashed $unnnic-color-neutral-soft;
  background: #ffffffcc;

  backdrop-filter: blur(5px);

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-title-sm;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  }

  &__description {
    padding: 0 $unnnic-spacing-sm;

    max-width: 600px;

    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    text-align: center;
  }

  &-drawer {
    &__widget-list {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-sm;

      .widget-list__item {
        padding: $unnnic-spacing-md;

        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: $unnnic-spacing-nano;

        border-radius: $unnnic-border-radius-md;
        border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

        cursor: pointer;

        .item__title {
          color: $unnnic-color-neutral-darkest;
          font-family: $unnnic-font-family-secondary;
          font-size: $unnnic-font-size-body-lg;
          font-weight: $unnnic-font-weight-bold;
          line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
        }

        .item__description {
          color: $unnnic-color-neutral-cloudy;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
        }
      }
    }
  }
}
</style>
