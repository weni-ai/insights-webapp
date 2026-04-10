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
  gap: $unnnic-space-1;
}

.agent-status-label {
  font: $unnnic-font-body;
  color: $unnnic-color-gray-10;
  overflow: hidden;
  text-overflow: ellipsis;
}

.agent-status {
  &.agent-status--online {
    :deep(.primary) {
      fill: $unnnic-color-aux-green-300;
    }
  }

  &.agent-status--offline {
    :deep(.primary) {
      fill: $unnnic-color-gray-4;
    }
  }

  &.agent-status--custom {
    :deep(.primary) {
      fill: $unnnic-color-orange-7;
    }
  }
}
</style>
