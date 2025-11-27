<template>
  <HeaderTagLive
    v-if="showTagLive"
    data-testid="insights-layout-header-tag-live"
  />

  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderDashboardSettings />
</template>

<script setup>
import HeaderTagLive from './HeaderTagLive.vue';
import InsightsLayoutHeaderFilters from './HeaderFilters/index.vue';
import HeaderDashboardSettings from './HeaderDashboardSettings.vue';

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
