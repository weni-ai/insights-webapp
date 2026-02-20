<template>
  <section class="analysis">
    <UnnnicDisclaimer
      v-if="!hasChatsSectors"
      :description="$t('human_support_dashboard.setup.disclaimer')"
    />
    <StatusCards data-testid="status-cards" />
    <ServicesOpenByHour data-testid="services-open-by-hour" />
    <CsatRatings
      v-if="isFeatureFlagEnabled('insightsCSAT')"
      type="analysis"
      data-testid="analysis-csat-ratings"
    />
    <DetailedAnalysis data-testid="detailed-analysis" />
    <NewsHumanSupportModal
      :modelValue="showNewsModal"
      type="analysis"
      @close="handleClose"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import StatusCards from './StatusCards.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedAnalysis from './DetailedAnalysis.vue';
import NewsHumanSupportModal from '../Common/Modals/NewsHumanSupportModal.vue';
import CsatRatings from '../CommonWidgets/CsatRatings/CsatRatings.vue';

import { useFeatureFlag } from '@/store/modules/featureFlag';
import { useProject } from '@/store/modules/project';

import { moduleStorage } from '@/utils/storage';

const STORAGE_KEY = 'news_modal_analysis_shown';
const showNewsModal = ref(false);

defineOptions({
  name: 'AnalysisView',
});

const projectStore = useProject();
const { hasChatsSectors } = storeToRefs(projectStore);

const { isFeatureFlagEnabled } = useFeatureFlag();

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
