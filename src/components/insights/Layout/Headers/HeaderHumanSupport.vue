<template>
  <HeaderTagLive
    v-if="showTagLive"
    data-testid="insights-layout-header-tag-live"
  />

  <LastUpdatedText v-if="isMonitoring" />

  <HeaderRefresh
    v-if="isMonitoring"
    type="human-support"
  />

  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderDashboardSettings />

  <HumanSupportExport v-if="isRenderHumanSupportBtnExport" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import HeaderTagLive from '../HeaderTagLive.vue';
import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HeaderDashboardSettings from '../HeaderDashboardSettings.vue';
import HumanSupportExport from '../../export/HumanSupportExport.vue';
import LastUpdatedText from '../HeaderFilters/LastUpdatedText.vue';
import HeaderRefresh from '../HeaderRefresh.vue';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

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

const humanSupportStore = useHumanSupport();
const { activeTab } = storeToRefs(humanSupportStore);

const isMonitoring = computed(() => activeTab.value === 'monitoring');
</script>
