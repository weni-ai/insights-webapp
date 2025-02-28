<template>
  <section
    class="dashboard-commerce"
    data-test-id="dashboard-commerce"
  >
    <section class="dashboard-commerce__header">
      <section
        class="dashboard-commerce__header-title"
        data-test-id="dashboard-commerce__header-title"
      >
        See what's happening in: Commerce
      </section>
      <section
        class="filter-type"
        data-test-id="filter-type"
      >
        <p class="filter-type_title">{{ $t('filter-by') }}</p>
        <DropdownFilter
          :items="[
            {
              name: 'today',
              action: () => handleFilter('Today'),
            },
            {
              name: 'Last 7 days',
              action: () => handleFilter('Last 7 days'),
            },
            {
              name: 'Last week',
              action: () => handleFilter('Last 14 days'),
            },
            {
              name: 'Last month',
              action: () => handleFilter('Last month'),
            },
          ]"
          :defaultItem="{ name: 'Last 7 days' }"
        />
      </section>
    </section>
    <section
      v-if="!isLoading"
      class="metrics-container"
    >
      <CardMetric
        v-for="(metric, index) in metrics"
        :key="metric.id"
        :title="metricTitles[metric.id]"
        :value="metric.value"
        :percentage="metric.percentage"
        :prefix="metric.prefix"
        :hasInfo="true"
        :leftColumn="index % 3 === 0"
        :rightColumn="(index + 1) % 3 === 0"
        :middleColumn="index % 3 === 1"
        :firstRow="index < 3"
        :lastRow="index >= metrics.length - (metrics.length % 3 || 3)"
      />
    </section>
    <section
      v-else
      class="dashboard-commerce__loading"
    >
      <IconLoading />
    </section>
  </section>
</template>

<script lang="ts" setup>
import { getLastNDays, getLastMonthRange, getTodayDate } from '@/utils/time';
import CardMetric from '@/components/home/CardMetric.vue';
import DropdownFilter from '@/components/home/DropdownFilter.vue';
import { ref } from 'vue';
import i18n from '@/utils/plugins/i18n';
import api from '@/services/api/resources/metrics';
import IconLoading from '@/components/IconLoading.vue';

interface MetricData {
  id: string;
  value: number;
  percentage: number;
  prefix?: string;
}

const infos = {
  'send-messages': i18n.global.t('dashboard_commerce.infos.send-message'),
  'delivered-messages': i18n.global.t(
    'dashboard_commerce.infos.delivered-messages',
  ),
  'read-messages': i18n.global.t('dashboard_commerce.infos.read-messages'),
  interactions: i18n.global.t('dashboard_commerce.infos.interactions'),
  'utm-revenue': i18n.global.t('dashboard_commerce.infos.utm-revenue'),
  'orders-placed': i18n.global.t('dashboard_commerce.infos.orders-placed'),
};

const metrics = ref<MetricData[]>([]);
const isLoading = ref(false);

const metricTitles: Record<string, string> = {
  'sent-messages': i18n.global.t('dashboard_commerce.titles.send-message'),
  'delivered-messages': i18n.global.t(
    'dashboard_commerce.titles.delivered-messages',
  ),
  'read-messages': i18n.global.t('dashboard_commerce.titles.read-messages'),
  interactions: i18n.global.t('dashboard_commerce.titles.interactions'),
  'utm-revenue': i18n.global.t('dashboard_commerce.titles.utm-revenue'),
  'orders-placed': i18n.global.t('dashboard_commerce.titles.orders-placed'),
};

const getMetrics = async (start: string, end: string) => {
  isLoading.value = true;
  try {
    const data: any = await api.getMetrics({
      start_date: start,
      end_date: end,
    });

    metrics.value = { ...data };
  } catch (error) {
    console.log('error getMetrics', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchMetrics = async () => {
  const { start, end } = getLastNDays(7);
  getMetrics(start, end);
};

fetchMetrics();

const handleFilter = async (filter: string) => {
  const type = filter.trim().replace(/\s+/g, '').toLowerCase();

  const getDateRanges = {
    today: getTodayDate(),
    last7days: getLastNDays(7),
    last14days: getLastNDays(14),
    lastmonth: getLastMonthRange(),
  };

  const { start, end } = getDateRanges[type];

  await getMetrics(start, end);
};
</script>

<style lang="scss" scoped>
.dashboard-commerce {
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    justify-content: space-between;
    width: 100%;

    &-title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-lg;
      font-style: normal;
      font-weight: $unnnic-font-weight-black;
      line-height: $unnnic-font-size-body-lg + $unnnic-line-height-md;
    }
  }

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding-top: $unnnic-spacing-md;
  }
}

.metrics-container {
  display: grid;
  grid-template-columns: repeat(3, minmax(250px, 1fr));
  padding: $unnnic-spacing-sm 1px;
}

.filter-type {
  display: flex;
  align-items: center;
  gap: $unnnic-spacing-sm;
  &_title {
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
