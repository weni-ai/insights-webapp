<template>
  <section class="monitoring">
    <ServiceStatus />
    <TimeMetrics />
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { useDashboards } from '@/store/modules/dashboards';
import ServiceStatus from './ServiceStatus.vue';
import TimeMetrics from './TimeMetrics.vue';

const isLoading = ref(false);
let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;

const AUTO_REFRESH_INTERVAL = 60 * 1000;

const { updateLastUpdatedRequest } = useDashboards();

const loadData = async () => {
  if (isLoading.value) {
    return;
  }

  try {
    isLoading.value = true;
    updateLastUpdatedRequest();
  } catch (error) {
    console.error('Erro to get data:', error);
  } finally {
    isLoading.value = false;
  }
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
};

onMounted(() => {
  console.log('Monitoring mounted');

  loadData();

  startAutoRefresh();
});

onUnmounted(() => {
  console.log('Monitoring unmounted');

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
