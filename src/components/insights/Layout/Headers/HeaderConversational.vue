<template>
  <InsightsLayoutHeaderFilters
    v-if="hasFilters"
    data-testid="insights-layout-header-filters"
  />

  <HeaderRefresh type="conversations" />

  <ConversationalExport v-if="isRenderConversationalBtnExport" />
</template>

<script setup>
import InsightsLayoutHeaderFilters from '../HeaderFilters/index.vue';
import HeaderRefresh from '../HeaderRefresh.vue';
import ConversationalExport from '../../export/ConversationalExport.vue';

defineProps({
  hasFilters: {
    type: Boolean,
    required: true,
  },
  isRenderConversationalBtnExport: {
    type: Boolean,
    required: true,
  },
});
</script>
