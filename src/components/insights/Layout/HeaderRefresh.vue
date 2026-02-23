<template>
  <UnnnicToolTip
    v-if="showTooltip"
    :text="$t('insights_header.refresh_button_tooltip')"
    side="top"
    enabled
    forceOpen
    showClose
    @click:close="handleCloseTooltip"
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
  <UnnnicButton
    v-else
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
import { onUnmounted, computed, ref, watch } from 'vue';
import { useTimeoutFn } from '@vueuse/core';
import { UnnnicButton } from '@weni/unnnic-system';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { storeToRefs } from 'pinia';
import { useConversational } from '@/store/modules/conversational/conversational';

const ONE_MINUTE_MS = 1000 * 60;

const props = defineProps<{
  type: 'human-support' | 'conversations';
}>();

const useMonitoring = useHumanSupportMonitoring();

const { isLoadingAllData, autoRefresh } = storeToRefs(useMonitoring);
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

const showTooltipTimeout = ref(null);
const showTooltip = ref(false);

const handleShowTooltip = () => {
  handleCloseTooltip();
  clearInterval(showTooltipTimeout.value);

  if (autoRefresh.value) {
    return;
  }

  showTooltipTimeout.value = setInterval(() => {
    showTooltip.value = true;
  }, ONE_MINUTE_MS);
};

const handleCloseTooltip = () => {
  showTooltip.value = false;
};

const refreshData = () => {
  clearInterval(showTooltipTimeout.value);
  handleRefreshData(true, false);

  timeoutStop?.();

  const { stop } = useTimeoutFn(() => {
    handleRefreshData(false, false);
  }, 500);

  timeoutStop = stop;

  handleShowTooltip();
};

watch(
  autoRefresh,
  () => {
    handleShowTooltip();
  },
  { immediate: true },
);

onUnmounted(() => {
  timeoutStop?.();
  clearInterval(showTooltipTimeout.value);
});
</script>

<style lang="scss" scoped>
.refresh-button {
  height: 100%;
}
</style>
