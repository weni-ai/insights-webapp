<template>
  <HeaderTagLive
    v-if="showTagLive"
    data-testid="insights-layout-header-tag-live"
  />

  <LastUpdatedText />

  <HeaderRefresh type="human-support" />

  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderDashboardSettings />

  <HumanSupportExport v-if="isRenderHumanSupportBtnExport" />
</template>

<script setup>
import HeaderTagLive from '../HeaderTagLive.vue';
import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HeaderDashboardSettings from '../HeaderDashboardSettings.vue';
import HeaderRefresh from '../HeaderRefresh.vue';
import HumanSupportExport from '../../export/HumanSupportExport.vue';
import LastUpdatedText from '../HeaderFilters/LastUpdatedText.vue';

defineProps({
  showTagLive: {
    type: Boolean,
    required: true,
  },
  hasFilters: {
    type: Boolean,
    required: true,
  },
  isRenderInsightButton: {
    type: Boolean,
    required: true,
  },
  isRenderHumanSupportBtnExport: {
    type: Boolean,
    required: true,
  },
  isRenderConversationalBtnExport: {
    type: Boolean,
    required: true,
  },
});
</script>
