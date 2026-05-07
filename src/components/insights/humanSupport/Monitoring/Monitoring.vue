<template>
  <section
    ref="monitoringRef"
    class="monitoring"
    data-testid="monitoring"
  >
    <UnnnicDisclaimer
      v-if="!hasSectorsConfigured"
      :description="$t('human_support_dashboard.setup.disclaimer')"
    />
    <StatusCards data-testid="monitoring-status-cards" />
    <TimeMetrics data-testid="monitoring-time-metrics" />
    <ServicesOpenByHour data-testid="monitoring-services-open-by-hour" />
    <VolumePerTagAndQueueWidget context="monitoring" />
    <CsatRatings
      v-if="isFeatureFlagEnabled('insightsCSAT')"
      type="monitoring"
      data-testid="monitoring-csat-ratings"
    />
    <DetailedMonitoring data-testid="monitoring-detailed-monitoring" />
  </section>
</template>

<script setup lang="ts">
import { onUnmounted, watch, ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTimeoutFn, useElementVisibility } from '@vueuse/core';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import { useProject } from '@/store/modules/project';

import StatusCards from './StatusCards.vue';
import TimeMetrics from './TimeMetrics.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedMonitoring from './DetailedMonitoring.vue';
import CsatRatings from '../CommonWidgets/CsatRatings/CsatRatings.vue';
import VolumePerTagAndQueueWidget from '../CommonWidgets/VolumePerTagAndQueue/index.vue';

const { isFeatureFlagEnabled } = useFeatureFlag();

defineOptions({
  name: 'MonitoringView',
});

const projectStore = useProject();
const { hasSectorsConfigured } = storeToRefs(projectStore);

let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;
let timeoutStop: (() => void) | null = null;

const AUTO_REFRESH_INTERVAL = 60 * 1000;

const humanSupportMonitoringStore = useHumanSupportMonitoring();

const { setRefreshDataMonitoring } = humanSupportMonitoringStore;
const { autoRefresh } = storeToRefs(humanSupportMonitoringStore);

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

watch(autoRefresh, () => {
  if (autoRefresh.value) {
    loadData();
    startAutoRefresh();
  } else {
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
