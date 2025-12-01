<template>
  <p
    class="helper-data-text"
    data-testid="helper-data-text"
  >
    {{ helperText }}
  </p>
</template>

<script setup lang="ts">
import { useDashboards } from '@/store/modules/dashboards';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, subDays, parse } from 'date-fns';

const { t } = useI18n();
const dashboardsStore = useDashboards();
const appliedFilters = computed(() => dashboardsStore.appliedFilters);
const lastUpdatedAt = computed(() => dashboardsStore.lastUpdatedAt);

const helperText = computed(() => {
  const endedAt = (appliedFilters.value as any)?.ended_at;
  const startDate = endedAt?.__gte;
  const endDate = endedAt?.__lte;

  if (!startDate || !endDate) return '';

  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const isOnlyYesterday = startDate === yesterday && endDate === yesterday;
  const endDateIsYesterday = endDate === yesterday;
  const endDateFormatted = format(
    parse(endDate, 'yyyy-MM-dd', new Date()),
    'dd/MM/yyyy',
  );

  if (isOnlyYesterday && lastUpdatedAt.value) {
    const time = format(lastUpdatedAt.value, 'HH:mm');
    return `${t('data_period.label')}: ${t('data_period.until')} ${time} (${endDateFormatted})`;
  }

  const startDateFormatted = format(
    parse(startDate, 'yyyy-MM-dd', new Date()),
    'dd/MM/yyyy',
  );
  const endTime =
    endDateIsYesterday && lastUpdatedAt.value
      ? format(lastUpdatedAt.value, 'HH:mm')
      : '23:59';

  const range = t('data_period.range', {
    start: `00:00 (${startDateFormatted})`,
    end: `${endTime} (${endDateFormatted})`,
  });

  return `${t('data_period.label')}: ${range}`;
});
</script>

<style lang="scss" scoped>
.helper-data-text {
  font: $unnnic-font-caption-2;

  overflow: hidden;
  color: $unnnic-color-fg-base;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
