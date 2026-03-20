<template>
  <section
    class="widget-error"
    data-testid="widget-error"
  >
    <UnnnicIcon
      icon="warning"
      size="md"
      scheme="feedback-red"
      data-testid="widget-error-icon"
    />
    <p
      class="widget-error__title"
      data-testid="widget-error-title"
    >
      {{ title }}
    </p>

    <p
      v-if="description"
      class="widget-error__description"
      data-testid="widget-error-description"
    >
      {{ description }}
    </p>

    <UnnnicButton
      :text="buttonText"
      type="warning"
      data-testid="widget-error-button"
      @click="handleClick"
    />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  buttonText: string;
}>();

const emit = defineEmits<{
  (_e: 'click'): void;
}>();

const handleClick = () => {
  emit('click');
};
</script>

<style scoped lang="scss">
.widget-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 400px;

  &__description {
    font: $unnnic-font-body;
    color: $unnnic-color-gray-7;
  }

  &__title {
    color: $unnnic-color-gray-12;
    font: $unnnic-font-display-2;
    font-weight: 900;
    text-align: center;
  }
}
</style>
