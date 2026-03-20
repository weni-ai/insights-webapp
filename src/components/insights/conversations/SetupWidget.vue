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
  gap: $unnnic-space-3;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;

  &__title {
    color: $unnnic-color-gray-12;
    font: $unnnic-font-display-2;
  }

  &__description {
    padding: 0 $unnnic-space-4;

    max-width: 600px;

    color: $unnnic-color-gray-7;
    font: $unnnic-font-emphasis;
    text-align: center;
  }
}
</style>
