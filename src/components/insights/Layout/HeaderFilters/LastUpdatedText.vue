<template>
  <section class="insights-layout-header-filters_last-updated-at">
    <p class="insights-layout-header-filters_last-updated-at_text">
      {{ $t('insights_header.last_updated_at') }} {{ formattedTime }}
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { formatTimeStringWithDayNight } from '@/utils/time';

import { useDashboards } from '@/store/modules/dashboards';

const dashboardsStore = useDashboards();
const lastUpdatedAt = computed(() => dashboardsStore.lastUpdatedAt);

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
