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
        {{ $t('dashboard_commerce.title') }}
      </section>
      <section
        class="filter-type"
        data-test-id="filter-type"
      >
        <p class="filter-type_title">{{ $t('filter-by') }}</p>
        <DropdownFilter
          :items="[
            {
              name: $t('dashboard_commerce.filters.today'),
              action: () => handleFilter('Today'),
            },
            {
              name: $t('dashboard_commerce.filters.last_7_days'),
              action: () => handleFilter('Last 7 days'),
            },
            {
              name: $t('dashboard_commerce.filters.last_14_days'),
              action: () => handleFilter('Last 14 days'),
            },
            {
              name: $t('dashboard_commerce.filters.last_month'),
              action: () => handleFilter('Last month'),
            },
          ]"
          :defaultItem="{ name: 'Last 7 days' }"
        />
      </section>
    </section>
    <section
      v-if="!isLoading && !isError"
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
      v-if="isLoading"
      class="dashboard-commerce__loading"
    >
      <IconLoading />
    </section>
    <section v-if="isError && !isLoading">
      <section class="dashboard-commerce__error">
        <UnnnicIcon
          icon="cancel"
          size="xl"
          class="dashboard-commerce__error-icon"
        />
        <p class="dashboard-commerce__error-title">
          {{ $t('dashboard_commerce.errors.title') }}
        </p>
        <p class="dashboard-commerce__error-description">
          {{ $t('dashboard_commerce.errors.description') }}
        </p>
      </section>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { getLastNDays, getLastMonthRange, getTodayDate } from '@/utils/time';
import CardMetric from '@/components/home/CardMetric.vue';
import DropdownFilter from '@/components/home/DropdownFilter.vue';
import { ref, defineProps, watch } from 'vue';
import i18n from '@/utils/plugins/i18n';
import api from '@/services/api/resources/metrics';
import IconLoading from '@/components/IconLoading.vue';

interface MetricData {
  id: string;
  value: number;
  percentage: number;
  prefix?: string;
}

const props = defineProps({
  auth: {
    type: Object as () => { token: string; uuid: string } | null,
    default: null,
  },
});

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
const isError = ref(false);
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
  if (!props.auth?.token || !props.auth?.uuid) return;

  isLoading.value = true;
  try {
    const data: any = await api.getMetrics({
      start_date: start,
      end_date: end,
      project_uuid: props.auth.uuid,
    },
    props.auth.token);

    metrics.value = { ...data };
    if (isError.value) isError.value = false;
  } catch (error) {
    isError.value = true; 
    console.log('error getMetrics', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchMetrics = async () => {
  const { start, end } = getLastNDays(7);
  getMetrics(start, end);
};

watch(
  () => props.auth?.token,
  (newToken) => {
    if (newToken && props.auth?.uuid) {
      fetchMetrics();
    }
  },
  { immediate: true }
);

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

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: $unnnic-border-radius-md;
    border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
    opacity: $unnnic-opacity-level-darkest;
    background: $unnnic-color-neutral-white;
    margin-top: $unnnic-spacing-sm;
    padding: $unnnic-spacing-lg;

    &-icon {
      margin-bottom: $unnnic-spacing-sm;
    }

    &-title {
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      font-style: normal;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }

    &-description {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      font-style: normal;
      font-weight: $unnnic-font-weight-regular;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }
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
