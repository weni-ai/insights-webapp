<template>
  <section class="header-ctwa">
    <UnnnicInputDatePicker
      v-model="appliedDateRange"
      class="header-ctwa__date"
      data-testid="ctwa-date-filter"
      :disableClear="true"
      position="right"
      :maxDate="maxDate"
      fillW
    />
    <!-- This will be made available in the future. -->
    <!-- <CampaignFilter v-model="selectedCampaign" /> -->
    <UnnnicButton
      data-testid="ctwa-refresh-button"
      class="header-ctwa__refresh"
      type="secondary"
      iconLeft="refresh"
      :text="$t('insights_header.refresh')"
      @click="handleRefresh"
    />
  </section>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

// import CampaignFilter from '@/components/insights/ctwa/CampaignFilter.vue';
import { useCTWA } from '@/store/modules/ctwa';
import { useDashboards } from '@/store/modules/dashboards';
import { getTodayDate } from '@/utils/time';

defineOptions({
  name: 'HeaderCTWA',
});

const router = useRouter();
const dashboardsStore = useDashboards();
const ctwaStore = useCTWA();
const { currentDashboard } = storeToRefs(dashboardsStore);
const { appliedDateRange, selectedCampaign } = storeToRefs(ctwaStore);
const { loadAllData } = ctwaStore;

const maxDate = getTodayDate().start;

const handleRefresh = () => {
  loadAllData();
};

watch(
  [appliedDateRange, selectedCampaign],
  ([dateRange, _campaign]) => {
    const dashboardUuid = currentDashboard.value?.uuid;

    if (!dashboardUuid) return;

    const query = { ...router.currentRoute.value.query };

    if (dateRange.start && dateRange.end) {
      query.start_date = dateRange.start;
      query.end_date = dateRange.end;
    }

    // This will be made available in the future.
    // if (campaign) {
    //   query.campaign = campaign;
    // } else {
    //   delete query.campaign;
    // }

    router.replace({
      name: 'dashboard',
      params: { dashboardUuid },
      query,
    });
  },
  { deep: true, immediate: true },
);
</script>

<style lang="scss" scoped>
.header-ctwa {
  display: flex;
  align-items: center;
  gap: $unnnic-space-4;

  :deep(.header-ctwa__date) {
    width: 304px;
    .unnnic-popover-trigger {
      width: 100%;
    }
  }

  &__refresh {
    height: 100%;
  }
}
</style>
