<template>
  <section class="agents-count">
    <template v-if="isLoadingCounts">
      <UnnnicSkeletonLoading
        v-for="i in 3"
        :key="i"
        width="65px"
        height="30px"
      />
    </template>
    <UnnnicTag
      v-for="tag in tags"
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
import { ref, watch } from 'vue';

import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

import attendantService from '@/services/api/resources/humanSupport/monitoring/detailedMonitoring/attendant';

import { storeToRefs } from 'pinia';

const humanSupportStore = useHumanSupport();
const { appliedFilters } = storeToRefs(humanSupportStore);

const humanSupportMonitoringStore = useHumanSupportMonitoring();
const { refreshDataMonitoring } = storeToRefs(humanSupportMonitoringStore);

const tags = ['online', 'on_break', 'offline'];

const tagsColorsTokens = {
  online: 'green-200',
  on_break: 'orange-200',
  offline: 'gray-100',
};

const isLoadingCounts = ref(false);
const counts = ref({
  online: 0,
  on_break: 0,
  offline: 0,
});

const loadCounts = async () => {
  try {
    isLoadingCounts.value = true;
    const response = await attendantService.getAgentsCountByStatus();
    counts.value = {
      online: response.online || 0,
      on_break: response.on_break || 0,
      offline: response.offline || 0,
    };
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingCounts.value = false;
  }
};

watch(
  [() => appliedFilters.value, () => refreshDataMonitoring.value],
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
