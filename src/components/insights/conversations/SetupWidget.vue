<template>
  <section
    class="setup-widget"
    data-testid="setup-widget"
  >
    <h2
      class="setup-widget__title"
      data-testid="setup-widget-title"
    >
      {{ title }}
    </h2>
    <p
      class="setup-widget__description"
      data-testid="setup-widget-description"
    >
      {{ description }}
    </p>
    <UnnnicButton
      data-testid="setup-widget-button"
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
.setup-widget {
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-ant;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

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
}
</style>
