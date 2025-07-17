<template>
  <UnnnicButton
    data-testid="add-topic-button"
    class="add-topic-button"
    :text="text"
    iconLeft="add-1"
    size="large"
    type="secondary"
    @click="handleAddTopic"
  />
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'add-topic'): void;
}>();

defineProps<{
  text: string;
}>();

const handleAddTopic = () => {
  emit('add-topic');
};
</script>

<style lang="scss" scoped>
.add-topic-button {
  width: 100%;

  :deep(.unnnic-icon__size--md) {
    width: $unnnic-icon-size-ant;
    height: $unnnic-icon-size-ant;
    min-width: $unnnic-icon-size-ant;
    min-height: $unnnic-icon-size-ant;
  }
}
</style>
