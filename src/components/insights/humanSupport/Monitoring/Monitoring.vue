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
  </section>
</template>

<script setup lang="ts">
import { onUnmounted, watch, ref, computed } from 'vue';
import { useTimeoutFn, useElementVisibility } from '@vueuse/core';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import StatusCards from './StatusCards.vue';
import TimeMetrics from './TimeMetrics.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedMonitoring from './DetailedMonitoring.vue';

let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;
let timeoutStop: (() => void) | null = null;

const AUTO_REFRESH_INTERVAL = 60 * 1000;

const { setRefreshDataMonitoring } = useHumanSupportMonitoring();

const monitoringRef = ref(null);
const isVisible = useElementVisibility(monitoringRef);

const shouldPoll = computed(() => isVisible.value);

const loadData = async () => {
  setRefreshDataMonitoring(true);

  timeoutStop?.();

  const { stop } = useTimeoutFn(() => {
    setRefreshDataMonitoring(false);
  }, 500);

  timeoutStop = stop;
};

const startAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }

  autoRefreshInterval = setInterval(() => {
    loadData();
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
