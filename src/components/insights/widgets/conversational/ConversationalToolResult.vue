<template>
  <ProgressWidget
    :title="$t('conversations_dashboard.tool_result')"
    :actions="[]"
    :progressItems="progressItems"
    :isLoading="isLoading && !hasData"
    :isLoadingProgress="isLoading"
    :currentTab="'artificial-intelligence'"
    :isOnlyTab="true"
    :isExpanded="isExpanded"
    :hiddenTabs="true"
    type="custom"
    @open-expanded="isSeeAllDrawerOpen = true"
  />

  <SeeAllDrawer
    v-if="isSeeAllDrawerOpen"
    v-model="isSeeAllDrawerOpen"
    :data="autoWidgetsStore.toolResult.data?.results || []"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import SeeAllDrawer from '@/components/insights/conversations/CustomizableWidget/SeeAllDrawer.vue';
import { useAutoWidgets } from '@/store/modules/conversational/autoWidgets';
import { useConversational } from '@/store/modules/conversational/conversational';
import {
  colorBgBlueStrong,
  colorBgBluePlain,
} from '@weni/unnnic-system/tokens/colors';

const route = useRoute();
const conversational = useConversational();
const autoWidgetsStore = useAutoWidgets();

const { shouldUseMock } = storeToRefs(conversational);

const isSeeAllDrawerOpen = ref(false);

const isLoading = computed(() => autoWidgetsStore.toolResult.isLoading);

const hasData = computed(() => autoWidgetsStore.hasToolResultData);

const isExpanded = computed(
  () => (autoWidgetsStore.toolResult.data?.results?.length ?? 0) > 5,
);

const progressItems = computed(() => {
  const results = autoWidgetsStore.toolResult.data?.results;

  if (!results?.length) {
    return [5, 4, 3, 2, 1].map(() => ({
      text: '-',
      value: 0,
      color: colorBgBlueStrong,
      backgroundColor: colorBgBluePlain,
    }));
  }

  return [...results]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((result) => ({
      text: result.label,
      full_value: result.full_value,
      value: result.value,
      color: colorBgBlueStrong,
      backgroundColor: colorBgBluePlain,
    }));
});

onMounted(() => {
  if (!shouldUseMock.value) {
    autoWidgetsStore.loadToolResultData();
  }
});

watch(
  () => route.query,
  () => {
    if (!shouldUseMock.value) {
      autoWidgetsStore.loadToolResultData();
    }
  },
  { deep: true },
);

watch(
  () => conversational.refreshDataConversational,
  (newValue) => {
    if (newValue && !shouldUseMock.value) {
      conversational.setIsLoadingConversationalData('dynamicWidgets', true);
      autoWidgetsStore.loadToolResultData().finally(() => {
        conversational.setIsLoadingConversationalData('dynamicWidgets', false);
      });
    }
  },
);
</script>
