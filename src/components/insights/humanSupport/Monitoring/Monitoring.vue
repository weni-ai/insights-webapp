<template>
  <section
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
import { onMounted, onUnmounted, watch } from 'vue';
import { useTimeoutFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useConfig } from '@/store/modules/config';
import StatusCards from './StatusCards.vue';
import TimeMetrics from './TimeMetrics.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedMonitoring from './DetailedMonitoring.vue';

let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;
let timeoutStop: (() => void) | null = null;

const AUTO_REFRESH_INTERVAL = 60 * 1000;

const { setRefreshDataMonitoring } = useHumanSupportMonitoring();
const configStore = useConfig();
const { isActiveRoute } = storeToRefs(configStore);

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

onMounted(() => {
  loadData();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});

watch(isActiveRoute, (newValue) => {
  if (newValue && !autoRefreshInterval) {
    startAutoRefresh();
  } else if (!newValue) {
    stopAutoRefresh();
  }
});
</script>

<style scoped lang="scss">
.monitoring {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;
}
</style>
