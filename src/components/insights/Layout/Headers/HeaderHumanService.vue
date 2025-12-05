<template>
  <HeaderTagLive
    v-if="showTagLive"
    data-testid="insights-layout-header-tag-live"
  />

  <LastUpdatedText />

  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderGenerateInsightButton
    data-testid="insights-layout-header-generate-insight-button"
  />

  <HumanSupportExport />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import moment from 'moment';

import HeaderTagLive from '../HeaderTagLive.vue';
import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HeaderGenerateInsightButton from '../HeaderGenerateInsights/HeaderGenerateInsightButton.vue';
import HumanSupportExport from '../../export/HumanSupportExport.vue';
import LastUpdatedText from '../HeaderFilters/LastUpdatedText.vue';
import { useDashboards } from '@/store/modules/dashboards';

const dashboardsStore = useDashboards();
const { currentDashboardFilters, appliedFilters } =
  storeToRefs(dashboardsStore);

const route = useRoute();

const showTagLive = computed(() => {
  const dateFilter = currentDashboardFilters.value.find(
    (filter) => filter.type === 'date_range',
  );

  const { query } = route;
  const today = moment().format('YYYY-MM-DD');

  const filteringDateValues = Object.values(
    appliedFilters.value[dateFilter?.name] || {},
  );

  const isFilteringToday = filteringDateValues.every(
    (filterDate) => filterDate === today,
  );

  return !query[dateFilter?.name] || isFilteringToday;
});

const hasFilters = computed(() => !!currentDashboardFilters.value.length);
</script>
