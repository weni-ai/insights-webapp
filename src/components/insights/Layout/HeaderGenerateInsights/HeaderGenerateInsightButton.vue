<template>
  <button
    class="header-generate-insight-button"
    :disabled="isDisableBtn"
    @click="openModal"
  >
    <img src="@/assets/images/shine.svg" />
    {{ $t('insights_header.generate_insight.title') }}

    <HeaderGenerateInsightModal
      :show="isGenerateInsightModalOpen"
      @close="closeModal"
    />
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useWidgets } from '@/store/modules/widgets';

import HeaderGenerateInsightModal from './HeaderGenerateInsightModal.vue';

defineOptions({ name: 'HeaderGenerateInsightButton' });

const widgetsStore = useWidgets();
const { isLoadingCurrentDashboardWidgets: isDisableBtn } =
  storeToRefs(widgetsStore);

const isGenerateInsightModalOpen = ref(false);

const openModal = () => {
  isGenerateInsightModalOpen.value = true;
};

const closeModal = () => {
  isGenerateInsightModalOpen.value = false;
};
</script>

<style scoped lang="scss">
.header-generate-insight-button {
  position: relative;

  border: none;

  display: flex;
  gap: $unnnic-space-1;
  justify-content: center;
  align-items: center;

  padding: $unnnic-space-3 $unnnic-space-4;

  border-radius: $unnnic-radius-1;
  background: $unnnic-color-gray-12;

  color: $unnnic-color-teal-5;

  font: $unnnic-font-body;

  cursor: pointer;
}
</style>
