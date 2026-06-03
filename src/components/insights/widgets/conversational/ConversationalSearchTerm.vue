<template>
  <BaseConversationWidget
    :title="title"
    :actions="actions"
    :isLoading="isLoading"
    hiddenTabs
    data-testid="conversational-search-term"
  >
    <UnnnicDisclaimer
      v-if="isError"
      type="error"
      :description="$t('conversations_dashboard.auto_widget_error')"
      data-testid="conversational-search-term-error"
    />
    <template v-else>
      <UnnnicDisclaimer
        v-if="isEmpty"
        type="neutral"
        :description="$t('conversations_dashboard.auto_widget_no_data')"
        data-testid="conversational-search-term-no-data"
      />
      <ProgressTable
        v-else
        :progressItems="progressItems"
        data-testid="conversational-search-term-table"
      />

      <section
        class="conversational-search-term__footer"
        data-testid="conversational-search-term-footer"
      >
        <p class="conversational-search-term__footer-count">
          {{
            $t('conversations_dashboard.search_term_count', {
              count: totalCount,
            })
          }}
        </p>
        <button
          v-if="showSeeAll"
          type="button"
          class="conversational-search-term__footer-see-all"
          data-testid="conversational-search-term-see-all"
          @click="isSeeAllDrawerOpen = true"
        >
          {{ $t('see_all') }}
        </button>
      </section>
    </template>
  </BaseConversationWidget>

  <ModalRemoveWidget
    v-if="isRemoveWidgetModalOpen"
    v-model="isRemoveWidgetModalOpen"
    type="search_term"
    :name="title"
  />

  <SeeAllDrawer
    v-if="isSeeAllDrawerOpen"
    v-model="isSeeAllDrawerOpen"
    :title="title"
    :data="results"
    :color="color"
    :backgroundColor="backgroundColor"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
import ProgressTable from '@/components/ProgressTable.vue';
import ModalRemoveWidget from '@/components/insights/conversations/CustomizableWidget/ModalRemoveWidget.vue';
import SeeAllDrawer from '@/components/insights/conversations/CustomizableWidget/SeeAllDrawer.vue';
import { UnnnicDisclaimer } from '@weni/unnnic-system';

import { useWidgetFormatting } from '@/composables/useWidgetFormatting';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useConversational } from '@/store/modules/conversational/conversational';

import {
  colorBgYellowStrong,
  colorBgYellowPlain,
} from '@weni/unnnic-system/tokens/colors';

const { t } = useI18n();
const route = useRoute();
const { formatPercentage, formatNumber } = useWidgetFormatting();

const conversational = useConversational();
const conversationalWidgets = useConversationalWidgets();
const { shouldUseMock } = storeToRefs(conversational);

const { loadSearchTermWidgetData } = conversationalWidgets;
const {
  searchTermWidgetData,
  isLoadingSearchTermWidgetData,
  isSearchTermWidgetDataError,
} = storeToRefs(conversationalWidgets);

const isRemoveWidgetModalOpen = ref(false);
const isSeeAllDrawerOpen = ref(false);

const color = colorBgYellowStrong;
const backgroundColor = colorBgYellowPlain;

const title = computed(() => t('conversations_dashboard.search_term'));

const isLoading = computed(() => isLoadingSearchTermWidgetData.value);

const isError = computed(() => isSearchTermWidgetDataError.value);

const results = computed(() =>
  [...(searchTermWidgetData.value?.results || [])].sort(
    (a, b) => b.value - a.value,
  ),
);

const totalCount = computed(() => results.value.length);

const isEmpty = computed(() => totalCount.value === 0);

const showSeeAll = computed(() => totalCount.value > 5);

const progressItems = computed(() =>
  results.value.slice(0, 5).map((result) => ({
    label: result.label,
    value: result.value,
    description: `${formatPercentage(result.value)} (${formatNumber(
      result.full_value,
    )})`,
    color,
    backgroundColor,
  })),
);

const actions = computed(() => {
  if (shouldUseMock.value) return [];

  return [
    {
      icon: 'delete',
      text: t('conversations_dashboard.customize_your_dashboard.remove_widget'),
      onClick: () => (isRemoveWidgetModalOpen.value = true),
      scheme: 'aux-red-500',
    },
  ];
});

onMounted(() => {
  loadSearchTermWidgetData();
});

watch(
  () => route.query,
  () => {
    loadSearchTermWidgetData();
  },
  { deep: true },
);

watch(
  () => conversational.refreshDataConversational,
  (newValue) => {
    if (newValue) {
      conversational.setIsLoadingConversationalData('dynamicWidgets', true);
      loadSearchTermWidgetData().finally(() => {
        conversational.setIsLoadingConversationalData('dynamicWidgets', false);
      });
    }
  },
);
</script>

<style scoped lang="scss">
.conversational-search-term {
  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    font: $unnnic-font-emphasis;
  }

  &__footer-count {
    color: $unnnic-color-fg-base;
  }

  &__footer-see-all {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-action;
  }
}
</style>
