<template>
  <section class="insights-layout-header-filters_last-updated-at">
    <UnnnicButton
      :iconCenter="
        autoRefresh
          ? 'material-symbols:pause-rounded'
          : 'material-symbols:play-arrow-rounded'
      "
      type="tertiary"
      @click="toggleAutoRefresh"
    />
    <UnnnicToolTip
      enabled
      side="top"
      :text="
        autoRefresh
          ? $t('insights_header.auto_refresh_on')
          : $t('insights_header.auto_refresh_off')
      "
    >
      <p class="insights-layout-header-filters_last-updated-at_text">
        {{
          $t('insights_header.auto_refresh', {
            status: autoRefresh ? $t('on') : $t('off'),
          })
        }}
        - {{ $t('insights_header.last_updated_at') }} {{ formattedTime }}
      </p>
    </UnnnicToolTip>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

import { formatTimeStringWithDayNight } from '@/utils/time';

const dashboardsStore = useDashboards();
const lastUpdatedAt = computed(() => dashboardsStore.lastUpdatedAt);

const humanSupportMonitoringStore = useHumanSupportMonitoring();
const { autoRefresh } = storeToRefs(humanSupportMonitoringStore);

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
};

const formattedTime = computed(() => {
  if (!lastUpdatedAt.value) return '--:--';
  return formatTimeStringWithDayNight(new Date(lastUpdatedAt.value), true);
});
</script>

<style lang="scss" scoped>
.insights-layout-header-filters_last-updated-at {
  display: flex;
  align-items: center;
  padding: 0 $unnnic-spacing-sm 0 0;
  gap: $unnnic-space-05;

  &_text {
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-style: normal;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    color: $unnnic-color-neutral-cloudy;
  }
}
</style>
