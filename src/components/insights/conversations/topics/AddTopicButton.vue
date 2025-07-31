<template>
  <UnnnicButton
    data-testid="add-topic-button"
    class="add-topic-button"
    :text="text"
    iconLeft="add-1"
    size="large"
    type="secondary"
    :disabled="disabled"
    @click="handleAddTopic"
  />
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'add-topic'): void;
}>();

defineProps<{
  text: string;
  disabled?: boolean;
}>();

const handleAddTopic = () => {
  emit('add-topic');
};
</script>

<style lang="scss" scoped>
.add-topic-button {
  width: 100%;
}
</style>
