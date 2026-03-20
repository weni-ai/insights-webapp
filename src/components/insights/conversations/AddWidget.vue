<template>
  <section
    class="add-widget"
    data-testid="add-widget"
  >
    <SetupWidget
      data-testid="setup-widget"
      :title="title"
      :description="description"
      :actionText="actionText"
      @action="emit('action')"
    />
  </section>
</template>

<script setup lang="ts">
import SetupWidget from './SetupWidget.vue';

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
  left: 0;

  display: flex;
  justify-content: center;

  width: 100%;
  height: 100%;

  border-radius: $unnnic-radius-2;
  border: 1px dashed $unnnic-color-gray-2;
  background: rgba(255, 255, 255, 0.8);

  backdrop-filter: blur(5px);
}
</style>
