<template>
  <section class="insights-layout-header-filters_last-updated-at">
    <UnnnicButton
      :iconCenter="playPauseIcon"
      type="tertiary"
      @click="toggleAutoRefresh"
    />
    <UnnnicToolTip
      enabled
      side="top"
      :text="autoRefreshLabelTooltipText"
    >
      <p class="insights-layout-header-filters_last-updated-at_text">
        {{
          $t('insights_header.auto_refresh', {
            status: autoRefreshLabelText,
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

import i18n from '@/utils/plugins/i18n';

import { UnnnicCallAlert } from '@weni/unnnic-system';

const dashboardsStore = useDashboards();
const lastUpdatedAt = computed(() => dashboardsStore.lastUpdatedAt);

const humanSupportMonitoringStore = useHumanSupportMonitoring();
const { autoRefresh } = storeToRefs(humanSupportMonitoringStore);

const autoRefreshLabelTooltipText = computed(() => {
  return autoRefresh.value
    ? i18n.global.t('insights_header.auto_refresh_on')
    : i18n.global.t('insights_header.auto_refresh_off');
});

const autoRefreshLabelText = computed(() => {
  const text = autoRefresh.value
    ? i18n.global.t('on')
    : i18n.global.t('paused');
  return text.toLowerCase();
});

const playPauseIcon = computed(() => {
  return autoRefresh.value
    ? 'material-symbols:pause-rounded'
    : 'material-symbols:play-arrow-rounded';
});

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;

  UnnnicCallAlert({
    props: {
      text: i18n.global.t('insights_header.auto_refresh_alert', {
        status: autoRefreshLabelText.value,
      }),
      type: 'success',
    },
    seconds: 5,
  });
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
