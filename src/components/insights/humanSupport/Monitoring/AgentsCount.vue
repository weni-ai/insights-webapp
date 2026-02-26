<template>
  <section class="agents-count">
    <template v-if="isLoadingCounts">
      <UnnnicSkeletonLoading
        v-for="i in activeTags.length"
        :key="i"
        width="65px"
        height="30px"
      />
    </template>
    <UnnnicTag
      v-for="tag in activeTags"
      v-else
      :key="tag"
      :text="
        $t(`human_support_dashboard.detailed_monitoring.agents_count.${tag}`, {
          count: counts[tag],
        })
      "
      :scheme="tagsColorsTokens[tag]"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

import attendantService from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/attendant';

import { storeToRefs } from 'pinia';

const humanSupportStore = useHumanSupport();
const { appliedFilters, appliedDetailFilters } = storeToRefs(humanSupportStore);

const humanSupportMonitoringStore = useHumanSupportMonitoring();
const { refreshDataMonitoring } = storeToRefs(humanSupportMonitoringStore);

const tags = ['online', 'custom_breaks', 'offline'];

const activeTags = computed(() => {
  const { status } = appliedDetailFilters.value;
  if (status.value.length === 0) return tags;

  const enabledTags = [];

  const statusValues = status.value as string[];

  if (statusValues.includes('online')) enabledTags.push('online');
  if (statusValues.includes('offline')) enabledTags.push('offline');

  const hasCustomStatus = statusValues.some(
    (status) => status !== 'online' && status !== 'offline',
  );

  if (hasCustomStatus) enabledTags.push('custom_breaks');

  return enabledTags;
});

const tagsColorsTokens = {
  online: 'green-200',
  custom_breaks: 'orange-200',
  offline: 'gray-100',
};

const isLoadingCounts = ref(false);
const counts = ref({
  online: 0,
  custom_breaks: 0,
  offline: 0,
});

const loadCounts = async () => {
  try {
    isLoadingCounts.value = true;
    const statusFilter = appliedDetailFilters.value.status.value as string[];
    const onlineOfflineFilter = statusFilter.filter(
      (status) => status === 'online' || status === 'offline',
    );
    const customBreaksFilter = statusFilter.filter(
      (status) => status !== 'online' && status !== 'offline',
    );
    const response = await attendantService.getAgentsCountByStatus({
      status: onlineOfflineFilter,
      custom_status: customBreaksFilter,
    });
    counts.value = {
      online: response.online || 0,
      custom_breaks: response.custom_breaks || 0,
      offline: response.offline || 0,
    };
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingCounts.value = false;
  }
};

watch(
  [
    () => appliedFilters.value,
    () => refreshDataMonitoring.value,
    () => activeTags.value,
  ],
  () => {
    loadCounts();
  },
  { immediate: true, deep: true },
);
</script>

<style scoped lang="scss">
.agents-count {
  display: flex;
  gap: $unnnic-space-1;
  align-self: end;
}
</style>
