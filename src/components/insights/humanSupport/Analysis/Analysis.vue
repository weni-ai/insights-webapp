<template>
  <section class="analysis">
    <UnnnicDisclaimer
      v-if="!hasSectorsConfigured"
      :description="$t('human_support_dashboard.setup.disclaimer')"
    />
    <LazyWidget>
      <StatusCards data-testid="status-cards" />
    </LazyWidget>
    <LazyWidget>
      <ServicesOpenByHour data-testid="services-open-by-hour" />
    </LazyWidget>
    <LazyWidget>
      <VolumePerTagAndQueueWidget context="analysis" />
    </LazyWidget>
    <LazyWidget v-if="isFeatureFlagEnabled('insightsCSAT')">
      <CsatRatings
        type="analysis"
        data-testid="analysis-csat-ratings"
      />
    </LazyWidget>
    <LazyWidget :forceVisible="forceLoadDetailed">
      <DetailedAnalysis data-testid="detailed-analysis" />
    </LazyWidget>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import StatusCards from './StatusCards.vue';
import ServicesOpenByHour from './ServicesOpenByHour.vue';
import DetailedAnalysis from './DetailedAnalysis.vue';
import CsatRatings from '../CommonWidgets/CsatRatings/CsatRatings.vue';
import VolumePerTagAndQueueWidget from '../CommonWidgets/VolumePerTagAndQueue/index.vue';
import LazyWidget from '@/components/insights/Layout/LazyWidget.vue';

import { useFeatureFlag } from '@/store/modules/featureFlag';
import { useProject } from '@/store/modules/project';
import { useHumanSupportAnalysis } from '@/store/modules/humanSupport/analysis';

defineOptions({
  name: 'AnalysisView',
});

const projectStore = useProject();
const { hasSectorsConfigured } = storeToRefs(projectStore);

const { forceLoadDetailed } = storeToRefs(useHumanSupportAnalysis());

const { isFeatureFlagEnabled } = useFeatureFlag();
</script>

<style scoped lang="scss">
.analysis {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;
}
</style>
