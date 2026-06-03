<template>
  <BaseConversationWidget
    :title="title"
    :actions="actions"
    :isLoading="isLoading"
    hiddenTabs
    data-testid="conversational-added-to-cart"
  >
    <UnnnicDisclaimer
      v-if="isError"
      type="error"
      :description="$t('conversations_dashboard.product_ranking_widget.error')"
      data-testid="conversational-added-to-cart-error"
    />
    <template v-else>
      <UnnnicDisclaimer
        v-if="isEmpty"
        type="neutral"
        :description="
          $t('conversations_dashboard.product_ranking_widget.no_data')
        "
        data-testid="conversational-added-to-cart-no-data"
      />
      <ProgressTable
        v-else
        :progressItems="progressItems"
        data-testid="conversational-added-to-cart-table"
      />

      <section
        class="conversational-added-to-cart__footer"
        data-testid="conversational-added-to-cart-footer"
      >
        <p class="conversational-added-to-cart__footer-count">
          {{
            $t(
              'conversations_dashboard.product_ranking_widget.products_count',
              {
                count: totalCount,
              },
            )
          }}
        </p>
        <button
          v-if="showSeeAll"
          type="button"
          class="conversational-added-to-cart__footer-see-all"
          data-testid="conversational-added-to-cart-see-all"
          @click="isSeeAllDrawerOpen = true"
        >
          {{ $t('conversations_dashboard.product_ranking_widget.see_all') }}
        </button>
      </section>
    </template>
  </BaseConversationWidget>

  <ModalRemoveWidget
    v-if="isRemoveWidgetModalOpen"
    v-model="isRemoveWidgetModalOpen"
    type="added_to_cart"
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
  colorBgGreenStrong,
  colorBgGreenPlain,
} from '@weni/unnnic-system/tokens/colors';

const { t } = useI18n();
const route = useRoute();
const { formatPercentage, formatNumber } = useWidgetFormatting();

const conversational = useConversational();
const conversationalWidgets = useConversationalWidgets();
const { shouldUseMock } = storeToRefs(conversational);

const { loadAddedToCartWidgetData } = conversationalWidgets;
const {
  addedToCartWidgetData,
  isLoadingAddedToCartWidgetData,
  isAddedToCartWidgetDataError,
} = storeToRefs(conversationalWidgets);

const isRemoveWidgetModalOpen = ref(false);
const isSeeAllDrawerOpen = ref(false);

const color = colorBgGreenStrong;
const backgroundColor = colorBgGreenPlain;

const title = computed(() =>
  t('conversations_dashboard.added_to_cart_widget.title'),
);

const isLoading = computed(() => isLoadingAddedToCartWidgetData.value);

const isError = computed(() => isAddedToCartWidgetDataError.value);

const results = computed(() =>
  [...(addedToCartWidgetData.value?.results || [])].sort(
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
  loadAddedToCartWidgetData();
});

watch(
  () => route.query,
  () => {
    loadAddedToCartWidgetData();
  },
  { deep: true },
);

watch(
  () => conversational.refreshDataConversational,
  (newValue) => {
    if (newValue) {
      conversational.setIsLoadingConversationalData('dynamicWidgets', true);
      loadAddedToCartWidgetData().finally(() => {
        conversational.setIsLoadingConversationalData('dynamicWidgets', false);
      });
    }
  },
);
</script>

<style scoped lang="scss">
.conversational-added-to-cart {
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
