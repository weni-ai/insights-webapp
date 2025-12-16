<template>
  <ProgressWidget
    :title="title"
    :actions="actions"
    :progressItems="[]"
    :isLoading="isLoading"
    :isError="isError"
    :actionError="actionError"
    type="sales_funnel"
  />

  <ModalRemoveWidget
    v-if="isRemoveWidgetModalOpen"
    v-model="isRemoveWidgetModalOpen"
    type="sales_funnel"
    :name="title"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import ModalRemoveWidget from '@/components/insights/conversations/CustomizableWidget/ModalRemoveWidget.vue';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useConversational } from '@/store/modules/conversational/conversational';

const { t } = useI18n();
const route = useRoute();
const conversational = useConversational();
const conversationalWidgets = useConversationalWidgets();

const { loadSalesFunnelWidgetData } = conversationalWidgets;
const { isLoadingSalesFunnelWidgetData, isSalesFunnelWidgetDataError } =
  storeToRefs(conversationalWidgets);

const isRemoveWidgetModalOpen = ref(false);

const title = computed(() => t('conversations_dashboard.sales_funnel'));

const isLoading = computed(() => isLoadingSalesFunnelWidgetData.value);

const isError = computed(() => isSalesFunnelWidgetDataError.value);

const actionError = computed(() => ({
  title: t('conversations_dashboard.widget_error.title'),
  buttonText: t('conversations_dashboard.widget_error.button'),
  onClick: () => (isRemoveWidgetModalOpen.value = true),
}));

const actions = computed(() => [
  {
    icon: 'delete',
    text: t('conversations_dashboard.customize_your_dashboard.remove_widget'),
    onClick: () => (isRemoveWidgetModalOpen.value = true),
    scheme: 'aux-red-500',
  },
]);

onMounted(() => {
  loadSalesFunnelWidgetData();
});

watch(
  () => route.query,
  () => {
    loadSalesFunnelWidgetData();
  },
  { deep: true },
);

watch(
  () => conversational.refreshDataConversational,
  (newValue) => {
    if (newValue) {
      conversational.setIsLoadingConversationalData('dynamicWidgets', true);
      loadSalesFunnelWidgetData().finally(() => {
        conversational.setIsLoadingConversationalData('dynamicWidgets', false);
      });
    }
  },
);
</script>
