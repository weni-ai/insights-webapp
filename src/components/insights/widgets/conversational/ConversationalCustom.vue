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
    type="custom"
    :uuid="uuid"
    @open-expanded="handleOpenExpanded"
  />

  <ModalRemoveWidget
    v-if="isRemoveWidgetModalOpen"
    v-model="isRemoveWidgetModalOpen"
    type="custom"
    :uuid="uuid"
    :name="titleWidget"
  />

  <SeeAllDrawer
    v-if="isSeeAllDrawerOpen"
    v-model="isSeeAllDrawerOpen"
    :data="getCustomWidgetByUuid(uuid)?.data?.results || []"
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
import type { CustomWidgetResponse } from '@/services/api/resources/conversational/widgets';

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
  setCustomForm,
} = customWidgetsStore;

const { customWidgetDataErrorByUuid } = storeToRefs(customWidgetsStore);

const isSeeAllDrawerOpen = ref(false);
const isRemoveWidgetModalOpen = ref(false);

const titleWidget = computed(() => {
  return getCustomWidgetByUuid(props.uuid)?.name || 'CUSTOM';
});

const isLoading = computed(() => getIsLoadingByUuid(props.uuid));

const isLoadingEmptyData = computed(
  () => !getCustomWidgetByUuid(props.uuid)?.data,
);

const isError = computed(() => {
  return !!customWidgetDataErrorByUuid.value[props.uuid] || false;
});

const actionError = computed(() => ({
  title: t('conversations_dashboard.widget_error.title'),
  buttonText: t('conversations_dashboard.widget_error.button'),
  onClick: () => handleOpenDrawer(false),
}));

const widgetData = computed(() => {
  return handleCustomWidgetData(
    (getCustomWidgetByUuid(props.uuid)?.data as CustomWidgetResponse) || {
      results: [],
    },
  );
});

const progressItems = computed(() => widgetData.value.progressItems);

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

const handleCustomWidgetData = (data: CustomWidgetResponse) => {
  const defaultColors = {
    color: '#3182CE',
    backgroundColor: '#BEE3F8',
  };

  if (data?.results?.length === 0) {
    return {
      progressItems: [5, 4, 3, 2, 1]?.map(() => ({
        text: '-',
        value: 0,
        color: defaultColors.color,
        backgroundColor: defaultColors.backgroundColor,
      })),
    };
  }

  const orderByValue = data?.results?.sort((a, b) => b.value - a.value);

  return {
    progressItems: orderByValue?.slice(0, 5)?.map((result) => ({
      text: result?.label,
      value: result?.value,
      color: defaultColors.color,
      backgroundColor: defaultColors.backgroundColor,
    })),
  };
};

const handleOpenDrawer = (isNew: boolean) => {
  if (!isNew) {
    const findedCustomWidget = getCustomWidgetByUuid(props.uuid) as any;
    setCustomForm({
      agent_uuid: findedCustomWidget?.config?.datalake_config?.agent_uuid,
      agent_name: '',
      key: findedCustomWidget?.config?.datalake_config?.key,
      widget_uuid: findedCustomWidget?.uuid,
      widget_name: findedCustomWidget?.name,
    });
  }

  setIsDrawerCustomizableOpen(true, 'custom', isNew);
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
