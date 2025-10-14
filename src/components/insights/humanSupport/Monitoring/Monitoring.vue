<template>
  <section
    class="monitoring"
    data-testid="monitoring"
  >
    <ServiceStatus data-testid="monitoring-service-status" />
    <TimeMetrics data-testid="monitoring-time-metrics" />
    <CsatRatings data-testid="monitoring-csat-ratings" />
    <ServicesOpenByHour data-testid="monitoring-services-open-by-hour" />
    <DetailedMonitoring data-testid="monitoring-detailed-monitoring" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useTimeoutFn } from '@vueuse/core';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import ServiceStatus from './ServiceStatus.vue';
import TimeMetrics from './TimeMetrics.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedMonitoring from './DetailedMonitoring.vue';
import CsatRatings from '../CommonWidgets/CsatRatings/CsatRatings.vue';

defineOptions({
  name: 'MonitoringView',
});

let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;
let timeoutStop: (() => void) | null = null;

const AUTO_REFRESH_INTERVAL = 60 * 1000;

const { loadAllData, setRefreshDetailedTabData } = useHumanSupportMonitoring();

const loadData = async () => {
  loadAllData();
  setRefreshDetailedTabData(true);

  timeoutStop?.();

  const { stop } = useTimeoutFn(() => {
    setRefreshDetailedTabData(false);
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
</script>

<style scoped lang="scss">
.monitoring {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;
}
</style>
