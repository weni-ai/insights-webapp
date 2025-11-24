<template>
  <UnnnicButton
    data-testid="refresh-button"
    class="refresh-button"
    :text="$t('insights_header.refresh')"
    type="tertiary"
    iconLeft="refresh"
    :disabled="isLoading"
    @click="refreshData"
  />
</template>

<script setup lang="ts">
import { onUnmounted, computed } from 'vue';
import { useTimeoutFn } from '@vueuse/core';
import { UnnnicButton } from '@weni/unnnic-system';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { storeToRefs } from 'pinia';
import { useConversational } from '@/store/modules/conversational/conversational';

const props = defineProps<{
  type: 'human-support' | 'conversations';
}>();

const useMonitoring = useHumanSupportMonitoring();

const { isLoadingAllData } = storeToRefs(useMonitoring);
const { setRefreshDataMonitoring } = useMonitoring;

const conversationalStore = useConversational();
const { setRefreshDataConversational } = conversationalStore;

let timeoutStop: (() => void) | null = null;

const handleRefreshData = (value: boolean) => {
  if (props.type === 'human-support') {
    setRefreshDataMonitoring(value);
  } else if (props.type === 'conversations') {
    setRefreshDataConversational(value);
  }
};

const isLoading = computed(() => {
  if (props.type === 'human-support') {
    return isLoadingAllData.value;
  } else if (props.type === 'conversations') {
    return conversationalStore.isLoadingConversationalData;
  }
  return false;
});

const refreshData = () => {
  handleRefreshData(true);

  timeoutStop?.();

  const { stop } = useTimeoutFn(() => {
    handleRefreshData(false);
  }, 500);

  timeoutStop = stop;
};

onUnmounted(() => {
  timeoutStop?.();
});
</script>

<style lang="scss" scoped>
.refresh-button {
  height: 100%;
}
</style>
