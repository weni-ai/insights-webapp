<template>
  <section
    ref="monitoringRef"
    class="monitoring"
    data-testid="monitoring"
  >
    <StatusCards data-testid="monitoring-status-cards" />
    <TimeMetrics data-testid="monitoring-time-metrics" />
    <ServicesOpenByHour data-testid="monitoring-services-open-by-hour" />
    <DetailedMonitoring data-testid="monitoring-detailed-monitoring" />
    <NewsHumanSupportModal
      :modelValue="showNewsModal"
      type="monitoring"
      @close="handleClose"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref, computed } from 'vue';
import { useTimeoutFn, useElementVisibility } from '@vueuse/core';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import StatusCards from './StatusCards.vue';
import TimeMetrics from './TimeMetrics.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedMonitoring from './DetailedMonitoring.vue';
import NewsHumanSupportModal from '../Common/Modals/NewsHumanSupportModal.vue';
import { moduleStorage } from '@/utils/storage';

const STORAGE_KEY = 'news_modal_monitoring_shown';
const showNewsModal = ref(false);

const handleClose = () => {
  showNewsModal.value = false;
  moduleStorage.setItem(STORAGE_KEY, true);
};

let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;
let timeoutStop: (() => void) | null = null;

const AUTO_REFRESH_INTERVAL = 60 * 1000;

const { setRefreshDataMonitoring } = useHumanSupportMonitoring();

const monitoringRef = ref(null);
const isVisible = useElementVisibility(monitoringRef);

const shouldPoll = computed(() => isVisible.value);

const loadData = async (silent = false) => {
  setRefreshDataMonitoring(true, silent);

  timeoutStop?.();

  const { stop } = useTimeoutFn(() => {
    setRefreshDataMonitoring(false, silent);
  }, 500);

  timeoutStop = stop;
};

const startAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  autoRefreshInterval = setInterval(() => {
    loadData(true);
  }, AUTO_REFRESH_INTERVAL);
};

const stopAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }

  if (timeoutStop) {
    timeoutStop();
    timeoutStop = null;
  }
};

onMounted(() => {
  const hasBeenShown = moduleStorage.getItem(STORAGE_KEY, false);
  if (!hasBeenShown) {
    showNewsModal.value = true;
  }
});

onUnmounted(() => {
  stopAutoRefresh();
});

watch(
  shouldPoll,
  (newValue) => {
    if (newValue && !autoRefreshInterval) {
      startAutoRefresh();
    } else if (!newValue && autoRefreshInterval) {
      stopAutoRefresh();
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.monitoring {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;
}
</style>
