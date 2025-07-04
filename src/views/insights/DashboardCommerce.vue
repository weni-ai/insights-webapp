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
        <UnnnicInputDatePicker
          data-test-id="filter-type__date-picker"
          :modelValue="filterValue"
          :options="filterOptions"
          :disableClear="true"
          position="right"
          :minDate="handleMinDate()"
          :maxDate="handleMaxDate()"
          @update:model-value="updateFilter"
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
        :prefix="metric.prefix"
        :tooltipInfo="infos[metric.id]"
        :leftColumn="index % 3 === 0"
        :rightColumn="(index + 1) % 3 === 0"
        :middleColumn="index % 3 === 1"
        :firstRow="index < 3"
        :lastRow="index >= 3"
      />
    </section>
    <section
      v-if="isLoading"
      class="dashboard-commerce__loading"
      data-test-id="dashboard-commerce__loading"
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
import { ref, onMounted, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import CardMetric from '@/components/home/CardMetric.vue';
import IconLoading from '@/components/IconLoading.vue';

import api from '@/services/api/resources/metrics';
import { getLastNDays, getTodayDate } from '@/utils/time';

interface MetricData {
  id: string;
  value: number;
  percentage: number;
  prefix?: string;
}

const { t } = useI18n();

const infos = computed(() => ({
  'sent-messages': t('dashboard_commerce.infos.send-message'),
  'delivered-messages': t('dashboard_commerce.infos.delivered-messages'),
  'read-messages': t('dashboard_commerce.infos.read-messages'),
  interactions: t('dashboard_commerce.infos.interactions'),
  'utm-revenue': t('dashboard_commerce.infos.utm-revenue'),
  'orders-placed': t('dashboard_commerce.infos.orders-placed'),
}));

const metrics = ref<MetricData[]>([]);
const isLoading = ref(false);
const isError = ref(false);
const filterValue = ref<{ start: string; end: string }>({
  start: '',
  end: '',
});
const auth = reactive({
  token: '',
  projectUuid: '',
});

const metricTitles = computed<Record<string, string>>(() => ({
  'sent-messages': t('dashboard_commerce.titles.send-message'),
  'delivered-messages': t('dashboard_commerce.titles.delivered-messages'),
  'read-messages': t('dashboard_commerce.titles.read-messages'),
  interactions: t('dashboard_commerce.titles.interactions'),
  'utm-revenue': t('dashboard_commerce.titles.utm-revenue'),
  'orders-placed': t('dashboard_commerce.titles.orders-placed'),
}));

const getMetrics = async (start: string, end: string) => {
  if (!auth?.token || !auth?.projectUuid) return;

  isLoading.value = true;
  try {
    const data: any = await api.getMetrics(
      {
        start_date: start,
        end_date: end,
        project_uuid: auth.projectUuid,
      },
      auth.token,
    );

    metrics.value = { ...data };
    if (isError.value) isError.value = false;
  } catch (error) {
    console.error('error getMetrics', error);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const fetchMetrics = async () => {
  const { start, end } = getLastNDays(7);
  filterValue.value = {
    start,
    end,
  };
  getMetrics(start, end);
};

const updateFilter = (value: { start: string; end: string }) => {
  filterValue.value = {
    start: value.start,
    end: value.end,
  };
  getMetrics(value.start, value.end);
};

const filterOptions = computed(() => [
  {
    name: t('dashboard_commerce.filters.last_7_days'),
    id: 'last-7-days',
  },
  {
    name: t('dashboard_commerce.filters.last_14_days'),
    id: 'last-14-days',
  },
  {
    name: t('dashboard_commerce.filters.last_30_days'),
    id: 'last-30-days',
  },
  {
    name: t('dashboard_commerce.filters.last_45_days'),
    id: 'last-45-days',
  },
  {
    name: t('dashboard_commerce.filters.last_90_days'),
    id: 'last-90-days',
  },
]);

const handleMinDate = () => {
  const minDate = getLastNDays(90).start;
  return minDate;
};

const handleMaxDate = () => {
  const maxDate = getTodayDate().start;
  return maxDate;
};

onMounted(() => {
  import('connect/sharedStore').then(({ useSharedStore }) => {
    const sharedStore = useSharedStore();

    auth.token = sharedStore.auth?.token;
    auth.projectUuid = sharedStore.current?.project?.uuid;

    fetchMetrics();
  });
});
</script>

<style lang="scss" scoped>
.dashboard-commerce {
  display: flex;
  flex-direction: column;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
