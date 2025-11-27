<template>
  <component
    :is="currentComponent"
    v-bind="componentProps"
  />
</template>

<script setup>
import { computed } from 'vue';

import DynamicHeaderHumanService from './DynamicHeaderHumanService.vue';
import DynamicHeaderHumanSupportMonitoring from './DynamicHeaderHumanSupportMonitoring.vue';
import DynamicHeaderHumanSupportAnalysis from './DynamicHeaderHumanSupportAnalysis.vue';
import DynamicHeaderConversational from './DynamicHeaderConversational.vue';
import DynamicHeaderDefault from './DynamicHeaderDefault.vue';

const props = defineProps({
  dashboardType: {
    type: String,
    required: true,
  },
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

const componentMap = {
  human_service: DynamicHeaderHumanService,
  human_support_monitoring: DynamicHeaderHumanSupportMonitoring,
  human_support_analysis: DynamicHeaderHumanSupportAnalysis,
  conversational: DynamicHeaderConversational,
  default: DynamicHeaderDefault,
};

const currentComponent = computed(() => {
  return componentMap[props.dashboardType] || DynamicHeaderDefault;
});

const componentProps = computed(() => ({
  showTagLive: props.showTagLive,
  hasFilters: props.hasFilters,
  isRenderInsightButton: props.isRenderInsightButton,
  isRenderHumanSupportBtnExport: props.isRenderHumanSupportBtnExport,
  isRenderConversationalBtnExport: props.isRenderConversationalBtnExport,
}));
</script>
