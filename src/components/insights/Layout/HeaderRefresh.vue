<template>
  <UnnnicButton
    data-testid="refresh-button"
    :text="$t('insights_header.refresh')"
    type="tertiary"
    iconLeft="refresh"
    :disabled="isLoadingAllData"
    @click="refreshData"
  />
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useTimeoutFn } from '@vueuse/core';
import { UnnnicButton } from '@weni/unnnic-system';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { storeToRefs } from 'pinia';

const useMonitoring = useHumanSupportMonitoring();

const { isLoadingAllData } = storeToRefs(useMonitoring);
const { loadAllData, setRefreshDetailedTabData } = useMonitoring;

let timeoutStop: (() => void) | null = null;

const refreshData = () => {
  loadAllData();
  setRefreshDetailedTabData(true);

  timeoutStop?.();

  const { stop } = useTimeoutFn(() => {
    setRefreshDetailedTabData(false);
  }, 500);

  timeoutStop = stop;
};

onUnmounted(() => {
  timeoutStop?.();
});
</script>
