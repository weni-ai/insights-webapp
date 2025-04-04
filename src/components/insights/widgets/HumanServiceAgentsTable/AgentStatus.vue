<template>
  <section class="agent-status-container">
    <UnnnicIcon
      icon="indicator"
      size="avatar-nano"
      :class="statusClass"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['green', 'gray', 'orange'].includes(value),
  },
});

const statusClass = computed(() => {
  return {
    'agent-status': true,
    [`agent-status--${props.status}`]: true,
  };
});
</script>

<style scoped lang="scss">
.agent-status-container {
  display: flex;
  gap: $unnnic-spacing-nano;
  align-items: end;
}

.agent-status {
  &.agent-status--green {
    :deep(.primary) {
      fill: $unnnic-color-aux-green-300;
    }
  }

  &.agent-status--gray {
    :deep(.primary) {
      fill: $unnnic-color-neutral-cleanest;
    }
  }

  &.agent-status--orange {
    :deep(.primary) {
      fill: $unnnic-color-aux-orange-500;
    }
  }
}
</style>
