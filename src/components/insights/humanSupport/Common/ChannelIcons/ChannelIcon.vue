<template>
  <component :is="channelComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { getChannelLabelComponent } from './channelIconMap';

defineOptions({
  name: 'ChannelIcon',
});

interface ChannelIconProps {
  channel: string;
}

const props = defineProps<ChannelIconProps>();

const channelComponent = computed(() => getChannelLabelComponent(props.channel));
</script>
