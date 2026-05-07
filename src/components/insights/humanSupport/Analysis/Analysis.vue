<template>
  <section class="analysis">
    <UnnnicDisclaimer
      v-if="!hasSectorsConfigured"
      :description="$t('human_support_dashboard.setup.disclaimer')"
    />
    <StatusCards data-testid="status-cards" />
    <ServicesOpenByHour data-testid="services-open-by-hour" />
    <VolumePerTagAndQueueWidget context="analysis" />
    <CsatRatings
      v-if="isFeatureFlagEnabled('insightsCSAT')"
      type="analysis"
      data-testid="analysis-csat-ratings"
    />
    <DetailedAnalysis data-testid="detailed-analysis" />
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import StatusCards from './StatusCards.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedAnalysis from './DetailedAnalysis.vue';
import CsatRatings from '../CommonWidgets/CsatRatings/CsatRatings.vue';
import VolumePerTagAndQueueWidget from '../CommonWidgets/VolumePerTagAndQueue/index.vue';

import { useFeatureFlag } from '@/store/modules/featureFlag';
import { useProject } from '@/store/modules/project';

defineOptions({
  name: 'AnalysisView',
});

const projectStore = useProject();
const { hasSectorsConfigured } = storeToRefs(projectStore);

const { isFeatureFlagEnabled } = useFeatureFlag();
</script>

<style scoped lang="scss">
.analysis {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;
}
</style>
