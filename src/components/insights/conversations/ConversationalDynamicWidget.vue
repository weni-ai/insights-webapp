<template>
  <section
    v-if="isDev"
    class="conversational-dynamic-widget"
  >
    <ProgressWidget
      title="CSAT"
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import env from '@/utils/env';

import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import AddCsatOrNpsWidget from '@/components/insights/conversations/CsatOrNpsWidget/AddCsatOrNpsWidget.vue';
import CsatOrNpsDrawer from '@/components/insights/conversations/CsatOrNpsWidget/CsatOrNpsDrawer.vue';
import ModalRemoveWidget from './CsatOrNpsWidget/ModalRemoveWidget.vue';

const { t } = useI18n();

const props = defineProps<{
  type: 'csat' | 'nps' | 'add';
}>();

const isDev = env('ENVIRONMENT') !== 'production';

const isDrawerOpen = ref(false);
const isRemoveWidgetModalOpen = ref(false);
function handleOpenDrawer() {
  isDrawerOpen.value = true;
}

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
