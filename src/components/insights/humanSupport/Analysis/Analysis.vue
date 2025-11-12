<template>
  <section class="analysis">
    <StatusCards data-testid="status-cards" />
    <ServicesOpenByHour data-testid="services-open-by-hour" />
    <DetailedAnalysis data-testid="detailed-analysis" />
    <NewsHumanSupportModal
      :modelValue="showNewsModal"
      type="analysis"
      @close="handleClose"
    />
  </section>
</template>

<script setup lang="ts">
import StatusCards from './StatusCards.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedAnalysis from './DetailedAnalysis.vue';
import NewsHumanSupportModal from '../Common/Modals/NewsHumanSupportModal.vue';
import { ref, onMounted } from 'vue';
import { moduleStorage } from '@/utils/storage';

const STORAGE_KEY = 'news_modal_analysis_shown';
const showNewsModal = ref(false);

onMounted(() => {
  const hasBeenShown = moduleStorage.getItem(STORAGE_KEY, false);
  if (!hasBeenShown) {
    showNewsModal.value = true;
  }
});

const handleClose = () => {
  showNewsModal.value = false;
  moduleStorage.setItem(STORAGE_KEY, true);
};
</script>

<style scoped lang="scss">
.analysis {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;
}
</style>
