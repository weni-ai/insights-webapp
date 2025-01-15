<template>
  <section class="agent-name-container">
    <UnnnicIcon
      icon="indicator"
      size="avatar-nano"
      :scheme="`feedback-${props.status?.toLowerCase() === 'green' ? 'green' : 'grey'}`"
    />
    <p>{{ props.name }}</p>
  </section>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.agent-name-container {
  display: flex;
  gap: $unnnic-spacing-nano;
  align-items: end;
}
</style>
