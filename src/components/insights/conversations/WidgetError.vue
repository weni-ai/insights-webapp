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
    color: $unnnic-color-neutral-cloudy;
  }

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    text-align: center;
    font-size: $unnnic-font-size-title-sm;
    font-weight: $unnnic-font-weight-black;
    line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
  }
}
</style>
