<template>
  <UnnnicInput
    v-if="shouldUseMock"
    :placeholder="datePlaceholder"
    iconLeft="calendar_month"
    disabled
    data-testid="mock-date-filter"
  />
  <InsightsLayoutHeaderFilters
    v-else-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderRefresh type="conversations" />

  <ConversationalExport />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HeaderRefresh from '../HeaderRefresh.vue';
import ConversationalExport from '../../export/ConversationalExport.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useConversational } from '@/store/modules/conversational/conversational';

const { t } = useI18n();
const dashboardsStore = useDashboards();
const { currentDashboardFilters } = storeToRefs(dashboardsStore);

const conversationalStore = useConversational();
const { shouldUseMock } = storeToRefs(conversationalStore);

const hasFilters = computed(() => !!currentDashboardFilters.value.length);
const datePlaceholder = computed(() => {
  const format = t('date_format');
  return `${format} - ${format}`;
});
</script>
