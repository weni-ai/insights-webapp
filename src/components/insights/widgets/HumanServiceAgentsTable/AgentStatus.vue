<template>
  <section class="agent-status-container">
    <UnnnicIcon
      icon="indicator"
      size="avatar-nano"
      :scheme="`feedback-${props.status?.toLowerCase() === 'green' ? 'green' : 'grey'}`"
    />
  </section>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.agent-status-container {
  display: flex;
  gap: $unnnic-spacing-nano;
  align-items: end;
}
</style>
