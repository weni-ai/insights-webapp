<template>
  <section class="widget-error">
    <UnnnicIcon
      icon="warning"
      size="md"
      scheme="feedback-red"
    />
    <p class="widget-error__title">
      {{ title }}
    </p>

    <UnnnicButton
      :text="buttonText"
      type="warning"
      @click="handleClick"
    />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  buttonText: string;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
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
