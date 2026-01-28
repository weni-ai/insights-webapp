<template>
  <UnnnicToolTip
    :forceOpen="newUpdatesAvailable"
    :text="$t('insights_header.refresh_button_tooltip')"
    side="top"
  >
    <UnnnicButton
      data-testid="refresh-button"
      class="refresh-button"
      :text="$t('insights_header.refresh')"
      type="tertiary"
      iconLeft="refresh"
      :disabled="isLoading"
      @click="refreshData"
    />
  </UnnnicToolTip>
</template>

<script setup lang="ts">
import { onUnmounted, computed, ref, onMounted } from 'vue';
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

const handleRefreshData = (value: boolean, silent = false) => {
  if (props.type === 'human-support') {
    setRefreshDataMonitoring(value, silent);
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

const newUpdatesInterval = ref(null);
const newUpdatesAvailable = ref(false);

const resetRefreshButtonTimeout = () => {
  if (newUpdatesInterval.value) {
    clearInterval(newUpdatesInterval.value);
  }
  newUpdatesInterval.value = setTimeout(() => {
    newUpdatesAvailable.value = true;
  }, 60 * 1000);
};

const refreshData = () => {
  handleRefreshData(true, false);

  timeoutStop?.();

  const { stop } = useTimeoutFn(() => {
    handleRefreshData(false, false);
  }, 500);

  timeoutStop = stop;

  newUpdatesAvailable.value = false;
  resetRefreshButtonTimeout();
};

onUnmounted(() => {
  timeoutStop?.();
});

onMounted(() => {
  resetRefreshButtonTimeout();
});
</script>

<style lang="scss" scoped>
.refresh-button {
  height: 100%;
}
</style>
