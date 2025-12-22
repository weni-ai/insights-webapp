<template>
  <ProgressWidget
    :title="titleWidget"
    :actions="actions"
    :progressItems="progressItems"
    :isLoading="isLoading && isLoadingEmptyData"
    :isLoadingProgress="isLoading"
    :currentTab="currentTab"
    :isOnlyTab="true"
    :isExpanded="isExpanded"
    :isError="isError"
    :actionError="actionError"
    type="crosstab"
    :uuid="uuid"
    @open-expanded="handleOpenExpanded"
  />

  <ModalRemoveWidget
    v-if="isRemoveWidgetModalOpen"
    v-model="isRemoveWidgetModalOpen"
    type="crosstab"
    :uuid="uuid"
    :name="titleWidget"
  />

  <SeeAllDrawer
    v-if="isSeeAllDrawerOpen"
    v-model="isSeeAllDrawerOpen"
    :data="getCustomWidgetByUuid(uuid)?.data?.results || []"
    :title="titleWidget"
    isCrosstab
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import ModalRemoveWidget from '@/components/insights/conversations/CustomizableWidget/ModalRemoveWidget.vue';
import SeeAllDrawer from '@/components/insights/conversations/CustomizableWidget/SeeAllDrawer.vue';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useConversational } from '@/store/modules/conversational/conversational';
import type { CrosstabWidgetResponse } from '@/services/api/resources/conversational/widgets';

interface Props {
  uuid: string;
}

const props = defineProps<Props>();

const { t } = useI18n();
const route = useRoute();
const conversational = useConversational();
const { setIsDrawerCustomizableOpen } = conversational;

const customWidgetsStore = useCustomWidgets();
const {
  loadCustomWidgetData,
  getCustomWidgetByUuid,
  getIsLoadingByUuid,
  setCrosstabForm,
} = customWidgetsStore;

const { customWidgetDataErrorByUuid } = storeToRefs(customWidgetsStore);

const isSeeAllDrawerOpen = ref(false);
const isRemoveWidgetModalOpen = ref(false);

const titleWidget = computed(() => {
  return getCustomWidgetByUuid(props.uuid)?.name || 'CROSSTAB';
});

const isLoading = computed(() => getIsLoadingByUuid(props.uuid));

const isLoadingEmptyData = computed(
  () => !getCustomWidgetByUuid(props.uuid)?.data,
);

const isError = computed(() => {
  return !!customWidgetDataErrorByUuid.value[props.uuid] || false;
});

const actionError = computed(() => {
  const widgetErrorCode = Number(
    customWidgetDataErrorByUuid.value[props.uuid] || 0,
  );
  const isValidationError = widgetErrorCode >= 400 && widgetErrorCode < 500;

  return {
    title: isValidationError
      ? t('conversations_dashboard.widget_error.crosstab_validation_title')
      : t('conversations_dashboard.widget_error.title'),
    buttonText: t('conversations_dashboard.widget_error.button'),
    description: isValidationError
      ? t(
          'conversations_dashboard.widget_error.crosstab_validation_description',
        )
      : undefined,
    onClick: () => handleOpenDrawer(false),
  };
});

const widgetData = computed(() => {
  return (
    (getCustomWidgetByUuid(props.uuid)?.data as CrosstabWidgetResponse) || {
      total_rows: 0,
      results: [],
    }
  );
});

const progressItems = computed(() => []);

const currentTab = computed(() => 'artificial-intelligence');

const isExpanded = computed(() => {
  const customWidget = getCustomWidgetByUuid(props.uuid);
  return customWidget?.data?.results?.length > 5 || false;
});

const actions = computed(() => {
  const editOption = {
    icon: 'edit_square',
    text: t(
      'conversations_dashboard.customize_your_dashboard.edit_csat_or_nps',
      { type: '' },
    ),
    onClick: () => handleOpenDrawer(false),
  };

  const deleteOption = {
    icon: 'delete',
    text: t('conversations_dashboard.customize_your_dashboard.remove_widget'),
    onClick: () => (isRemoveWidgetModalOpen.value = true),
    scheme: 'aux-red-500',
  };

  return [editOption, deleteOption];
});

const handleOpenDrawer = (isNew: boolean) => {
  if (!isNew) {
    const findedCustomWidget = getCustomWidgetByUuid(props.uuid) as any;
    setCrosstabForm({
      widget_uuid: findedCustomWidget?.uuid,
      widget_name: findedCustomWidget?.name,
      key_a: findedCustomWidget?.config?.source_a?.key,
      field_name_a: findedCustomWidget?.config?.source_a?.field_name,
      key_b: findedCustomWidget?.config?.source_b?.key,
      field_name_b: findedCustomWidget?.config?.source_b?.field_name,
    });
  }

  setIsDrawerCustomizableOpen(true, 'crosstab', isNew);
};

const handleOpenExpanded = () => {
  isSeeAllDrawerOpen.value = true;
};

onMounted(() => {
  loadCustomWidgetData(props.uuid);
});

watch(
  () => route.query,
  () => {
    loadCustomWidgetData(props.uuid);
  },
  { deep: true },
);

watch(
  () => conversational.refreshDataConversational,
  (newValue) => {
    if (newValue) {
      conversational.setIsLoadingConversationalData('dynamicWidgets', true);
      loadCustomWidgetData(props.uuid).finally(() => {
        conversational.setIsLoadingConversationalData('dynamicWidgets', false);
      });
    }
  },
);
</script>
