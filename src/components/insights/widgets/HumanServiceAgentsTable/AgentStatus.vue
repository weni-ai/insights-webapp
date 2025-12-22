<template>
  <section
    class="agent-status-container"
    data-testid="agent-status-container"
  >
    <UnnnicIcon
      icon="indicator"
      size="avatar-nano"
      :class="statusClass"
      data-testid="agent-status-icon"
    />
    <span
      v-if="label"
      class="agent-status-label"
      data-testid="agent-status-label"
    >
      {{ renderLabel }}
    </span>
    <DisconnectAgent
      v-if="enabledDisconnectAgent"
      :agent="agent"
      @request-data="emits('request-data')"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';

import DisconnectAgent from '@/components/DisconnectAgent.vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['online', 'offline', 'custom'].includes(value),
  },
  label: {
    type: String,
    default: '',
  },
  agent: {
    type: Object,
    default: () => ({
      name: '',
      email: '',
    }),
    required: false,
  },
});

const emits = defineEmits(['request-data']);

const statusClass = computed(() => {
  return {
    'agent-status': true,
    [`agent-status--${props.status}`]: true,
  };
});

const enabledDisconnectAgent = computed(() => {
  return ['online', 'custom'].includes(props.status) && !!props.agent?.email;
});

const renderLabel = computed(() => {
  return props?.label?.slice(0, 1).toUpperCase() + props?.label?.slice(1) || '';
});
</script>

<style scoped lang="scss">
.agent-status-container {
  display: flex;
  align-items: center;
  gap: $unnnic-spacing-nano;
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
  &.agent-status--online {
    :deep(.primary) {
      fill: $unnnic-color-aux-green-300;
    }
  }

  &.agent-status--offline {
    :deep(.primary) {
      fill: $unnnic-color-neutral-cleanest;
    }
  }

  &.agent-status--custom {
    :deep(.primary) {
      fill: $unnnic-color-aux-orange-500;
    }
  }
}
</style>
