<template>
  <section
    v-if="isDev"
    class="conversational-dynamic-widget"
  >
    <ProgressWidget
      :title="widgetType?.toUpperCase() || '-'"
      :actions="actions"
      :progressItems="[
        {
          text: '🤩 Very satisfied',
          value: 57,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
        {
          text: '😁 Satisfied',
          value: 25,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
        {
          text: '😐 Neutral',
          value: 12,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
        {
          text: '☹️ Dissatisfied',
          value: 5,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
        {
          text: '😡 Very dissatisfied',
          value: 1,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
      ]"
      footerText="1500 reviews"
    />
    <AddCsatOrNpsWidget
      v-if="type === 'add'"
      @add="handleOpenDrawer"
    />

    <CsatOrNpsDrawer
      v-if="isDrawerOpen"
      :modelValue="isDrawerOpen"
      :type="type === 'add' ? null : type"
      @update:model-value="isDrawerOpen = $event"
    />
    <ModalRemoveWidget
      v-if="isRemoveWidgetModalOpen && type !== 'add'"
      v-model="isRemoveWidgetModalOpen"
      :type="type"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import AddCsatOrNpsWidget from '@/components/insights/conversations/CsatOrNpsWidget/AddCsatOrNpsWidget.vue';
import CsatOrNpsDrawer from '@/components/insights/conversations/CsatOrNpsWidget/CsatOrNpsDrawer.vue';
import ModalRemoveWidget from './CsatOrNpsWidget/ModalRemoveWidget.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
import env from '@/utils/env';
import { useConversational } from '@/store/modules/conversational/conversational';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  type: 'csat' | 'nps' | 'add';
}>();

const isDev = env('ENVIRONMENT') !== 'production';

const isDrawerOpen = ref(false);
const isRemoveWidgetModalOpen = ref(false);
function handleOpenDrawer() {
  isDrawerOpen.value = true;
}
const conversational = useConversational();
const { loadCsatWidgetData, loadNpsWidgetData } = conversational;
const {
  csatWidget,
  npsWidget,
  isLoadingCsatWidgetData,
  isLoadingNpsWidgetData,
} = storeToRefs(conversational);

const widgetType = computed(() => {
  const widgetTypes = {
    csat: 'csat',
    nps: 'nps',
  };

  return widgetTypes[props.type];
});

const widget = computed(() => {
  const widgetTypes = {
    csat: csatWidget.value,
    nps: npsWidget.value,
  };

  return widgetTypes[props.type];
});

const isLoading = computed(() => {
  const isLoadingTypes = {
    csat: isLoadingCsatWidgetData,
    nps: isLoadingNpsWidgetData,
  };

  return isLoadingTypes[props.type];
});

const widgetData = computed(() => {
  const widgetDataTypes = {
    csat: csatWidget.value?.data,
    nps: npsWidget.value?.data,
  };
  console.log(widgetDataTypes[props.type]);
  return widgetDataTypes[props.type];
});

onMounted(() => {
  console.log('onMounted', props.type);
  const isCsatOrNps = ['csat', 'nps'].includes(props.type);

  if (isCsatOrNps) {
    const loadWidgetData = {
      csat: loadCsatWidgetData,
      nps: loadNpsWidgetData,
    };
    console.log('loadWidgetData mounted', props.type);
    loadWidgetData[props.type]();
  }
});

const actions = [
  {
    icon: 'edit_square',
    text: t(
      'conversations_dashboard.customize_your_dashboard.edit_csat_or_nps',
      { type: props.type },
    ),
    onClick: () => handleOpenDrawer(),
  },
  {
    icon: 'delete',
    text: t('conversations_dashboard.customize_your_dashboard.remove_widget'),
    onClick: () => (isRemoveWidgetModalOpen.value = true),
    scheme: 'aux-red-500',
  },
];
</script>

<style lang="scss" scoped>
.conversational-dynamic-widget {
  position: relative;
}
</style>
