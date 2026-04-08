<template>
  <BaseConversationWidget
    :title="$t('conversations_dashboard.tool_result')"
    :isLoading="isLoading && !hasData"
    :hiddenTabs="true"
  >
    <UnnnicDisclaimer
      v-if="hasError"
      :description="$t('conversations_dashboard.auto_widget_error')"
      type="error"
    />

    <template v-else-if="!isLoading">
      <UnnnicDisclaimer
        v-if="!hasData"
        :description="$t('conversations_dashboard.auto_widget_no_data')"
        type="neutral"
      />

      <ProgressTable
        v-else
        :progressItems="progressItems"
      />
    </template>

    <section
      v-if="isLoading && hasData"
      class="auto-widget__skeleton-container"
    >
      <UnnnicSkeletonLoading
        v-for="index in 5"
        :key="index"
        width="100%"
        height="56px"
      />
    </section>

    <section
      v-if="!hasError && !isLoading"
      class="auto-widget__footer"
    >
      <p class="auto-widget__footer-count">
        {{
          $t('conversations_dashboard.tool_result_count', { count: totalCount })
        }}
      </p>
      <UnnnicButton
        v-if="isExpanded"
        :text="$t('see_all')"
        type="tertiary"
        @click.stop="isSeeAllDrawerOpen = true"
      />
    </section>
  </BaseConversationWidget>

  <SeeAllDrawer
    v-if="isSeeAllDrawerOpen"
    v-model="isSeeAllDrawerOpen"
    :title="$t('conversations_dashboard.tool_result')"
    :data="autoWidgetsStore.toolResult.data?.results || []"
    :color="colorBgTealStrong"
    :backgroundColor="colorBgTealPlain"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { UnnnicDisclaimer } from '@weni/unnnic-system';

import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
import ProgressTable from '@/components/ProgressTable.vue';
import SeeAllDrawer from '@/components/insights/conversations/CustomizableWidget/SeeAllDrawer.vue';
import { useAutoWidgets } from '@/store/modules/conversational/autoWidgets';
import { useConversational } from '@/store/modules/conversational/conversational';
import { formatPercentage, formatNumber } from '@/utils/numbers';
import {
  colorBgTealStrong,
  colorBgTealPlain,
} from '@weni/unnnic-system/tokens/colors';

const route = useRoute();
const conversational = useConversational();
const autoWidgetsStore = useAutoWidgets();

const { shouldUseMock } = storeToRefs(conversational);

const isSeeAllDrawerOpen = ref(false);

const isLoading = computed(() => autoWidgetsStore.toolResult.isLoading);
const hasData = computed(() => autoWidgetsStore.hasToolResultData);
const hasError = computed(() => autoWidgetsStore.toolResult.error);

const results = computed(() => autoWidgetsStore.toolResult.data?.results ?? []);

const totalCount = computed(
  () => autoWidgetsStore.toolResult.data?.total ?? results.value.length,
);

const isExpanded = computed(() => results.value.length > 5);

const progressItems = computed(() => {
  return [...results.value]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((result) => ({
      label: result.label,
      description: `${formatPercentage(result.value)} (${formatNumber(result.full_value)})`,
      value: result.value,
      color: colorBgTealStrong,
      backgroundColor: colorBgTealPlain,
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

<style lang="scss" scoped>
.auto-widget {
  &__skeleton-container {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__footer {
    display: flex;
    align-items: center;
    margin-top: auto;
  }

  &__footer-count {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-emphasis;
    width: 100%;
  }
}
</style>
