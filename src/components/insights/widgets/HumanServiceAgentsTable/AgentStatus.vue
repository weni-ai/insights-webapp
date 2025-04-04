<template>
  <section class="agent-status-container">
    <UnnnicIcon
      icon="indicator"
      size="avatar-nano"
      :class="statusClass"
    />
    <span
      v-if="label"
      class="agent-status-label"
    >
      {{ label }}
    </span>
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
  label: {
    type: String,
    default: '',
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
  align-items: center;
}

.agent-status-label {
  font-family: $unnnic-font-family-secondary;
  color: $unnnic-color-neutral-dark;
  overflow: hidden;
  text-overflow: ellipsis;

  font-size: $unnnic-font-size-body-gt;
  font-style: normal;
  font-weight: $unnnic-font-weight-regular;
  line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
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
