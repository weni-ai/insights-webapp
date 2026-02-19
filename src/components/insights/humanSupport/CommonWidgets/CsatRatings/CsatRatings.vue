<template>
  <section
    ref="csatRatings"
    class="csat-ratings-widget"
  >
    <BlurSetupWidget
      v-if="showSetup"
      v-bind="widgetSetupProps"
    />
    <BlurSetupWidget
      v-if="!configStore.enableCsat && !isLoadingAgentsData"
      :title="$t('human_support_dashboard.csat.title')"
      :description="$t('human_support_dashboard.csat.disabled_text')"
      :actionButtonProps="{
        text: $t('enable'),
        type: 'primary',
        size: 'small',
      }"
      :actionClick="redirectToChatsConfig"
    />
    <h1 class="csat-ratings-widget__title">
      {{ $t('human_support_dashboard.csat.title') }}
    </h1>
    <section class="csat-ratings-widget__content">
      <section
        ref="agentsContainerRef"
        class="csat-ratings-widget__agents"
      >
        <template v-if="isLoadingAgentsData">
          <UnnnicSkeletonLoading
            v-for="i in 5"
            :key="i"
            width="100%"
            height="60px"
          />
        </template>
        <template v-else>
          <AgentCard
            class="csat-ratings-widget__agent-card"
            :title="
              $t('human_support_dashboard.csat.agents_ratings_general_title')
            "
            :subtitle="
              $t('human_support_dashboard.csat.agents_ratings_subtitle', {
                rooms: agentsGeneralTotals.rooms,
                reviews: agentsGeneralTotals.reviews,
              })
            "
            :tooltip="
              $t('human_support_dashboard.csat.agents_ratings_general_tooltip')
            "
            :rating="agentsGeneralTotals.avg_rating"
            :active="!activeAgentEmail"
            hiddenAvatar
            @click="activeAgentEmail = null"
          />
          <AgentCard
            v-for="agent in agentsData"
            :key="agent.agent.email"
            class="csat-ratings-widget__agent-card"
            :title="agent.agent.name"
            :subtitle="
              $t('human_support_dashboard.csat.agents_ratings_subtitle', {
                rooms: agent.rooms,
                reviews: agent.reviews,
              })
            "
            :rating="agent.avg_rating"
            :active="activeAgentEmail === agent.agent.email"
            @click="activeAgentEmail = agent.agent.email"
          />
        </template>
      </section>
      <section
        v-if="isLoadingRatingsData"
        class="csat-ratings-widget__ratings-loading"
      >
        <UnnnicSkeletonLoading
          v-for="i in 5"
          :key="i"
          width="100%"
          height="60px"
        />
      </section>
      <section
        v-else
        class="csat-ratings-widget__ratings"
      >
        <ProgressTable
          :progressItems="progressItemsRatingsData"
          :isLoading="isLoadingRatingsData"
        />
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useInfiniteScroll, useMouseInElement } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import type {
  AgentsTotalsResponse,
  RatingsResponse,
} from '@/services/api/resources/humanSupport/csat';

import AgentCard from './AgentCard.vue';
import ProgressTable from '@/components/ProgressTable.vue';
import BlurSetupWidget from '@/components/insights/Layout/BlurSetupWidget.vue';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useConfig } from '@/store/modules/config';
import { useProject } from '@/store/modules/project';

import Csat from '@/services/api/resources/humanSupport/csat';

import { parseQueryString } from '@/utils/request';
import { formatPercentage } from '@/utils/numbers';
import { redirectToChatsConfig } from '@/utils/redirect';

defineOptions({
  name: 'CsatRatings',
});

interface Props {
  type: 'monitoring' | 'analysis';
}

const props = defineProps<Props>();

onMounted(() => {
  configStore.checkEnableCsat().then(() => {
    if (configStore.enableCsat) {
      loadAgentsData();
      loadRatingsData();
    } else {
      isLoadingAgentsData.value = false;
      isLoadingRatingsData.value = false;
    }
  });
});

const { t, locale: localeI18n } = useI18n();

const humanSupportMonitoringStore = useHumanSupportMonitoring();
const humanSupportStore = useHumanSupport();
const configStore = useConfig();
const projectStore = useProject();

const { hasChatsSectors } = storeToRefs(projectStore);
const { widgetSetupProps, appliedFilters, appliedDateRange } =
  storeToRefs(humanSupportStore);

const csatRatingsRef = useTemplateRef<HTMLElement>('csatRatings');
const { isOutside } = useMouseInElement(csatRatingsRef);

const showSetup = computed(() => {
  return !hasChatsSectors.value && !isOutside.value;
});

const agentsContainerRef = useTemplateRef<HTMLElement>('agentsContainerRef');

useInfiniteScroll(agentsContainerRef, async () => {
  if (agentsTotalNext.value)
    await loadAgentsData({ silent: true, concat: true });
});

const isLoadingAgentsData = ref(true);
const isLoadingRatingsData = ref(true);

const agentsTotalNext = ref<string | null>(null);

const agentsGeneralTotals = ref<AgentsTotalsResponse['general']>({
  rooms: 0,
  reviews: 0,
  avg_rating: 0,
});

const agentsData = ref<AgentsTotalsResponse['results']>([]);
const ratingsData = ref<RatingsResponse>({
  '5': { value: 0, full_value: 0 },
  '4': { value: 0, full_value: 0 },
  '3': { value: 0, full_value: 0 },
  '2': { value: 0, full_value: 0 },
  '1': { value: 0, full_value: 0 },
});

const progressItemsRatingsData = computed(() => {
  const labelMapping = {
    '5': t('human_support_dashboard.csat.review_rating.very_satisfied'),
    '4': t('human_support_dashboard.csat.review_rating.satisfied'),
    '3': t('human_support_dashboard.csat.review_rating.neutral'),
    '2': t('human_support_dashboard.csat.review_rating.dissatisfied'),
    '1': t('human_support_dashboard.csat.review_rating.very_dissatisfied'),
  };
  return Object.entries(ratingsData.value)
    .reverse()
    .map(([key, value]) => ({
      label: labelMapping[key as keyof typeof labelMapping],
      backgroundColor: '#E9D8FD',
      color: '#805AD5',
      value: value.value,
      description: `${formatPercentage(value.value, localeI18n.value)} (${value.full_value})`,
    }));
});

const loadAgentsData = async ({
  silent = false,
  concat = false,
}: { silent?: boolean; concat?: boolean } = {}) => {
  if (!silent) {
    isLoadingAgentsData.value = true;
  }
  try {
    const getTotalsFunction =
      props.type === 'monitoring'
        ? Csat.getTotalsMonitoring
        : Csat.getTotalsAnalysis;

    const { general, next, results } = await getTotalsFunction({
      cursor: agentsTotalNext.value,
    });
    agentsGeneralTotals.value = general;
    agentsTotalNext.value = parseQueryString(next)?.cursor;
    agentsData.value = concat ? agentsData.value.concat(results) : results;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingAgentsData.value = false;
  }
};

const loadRatingsData = async ({
  silent = false,
}: { silent?: boolean } = {}) => {
  if (!silent) {
    isLoadingRatingsData.value = true;
  }
  try {
    const getRatingsFunction =
      props.type === 'monitoring'
        ? Csat.getRatingsMonitoring
        : Csat.getRatingsAnalysis;

    const response = await getRatingsFunction({
      agent_email: activeAgentEmail.value,
    });
    ratingsData.value = response;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingRatingsData.value = false;
  }
};

const activeAgentEmail = ref<string | null>(null);

watch(activeAgentEmail, () => {
  loadRatingsData();
});

watch(
  () => [appliedFilters.value, appliedDateRange.value],
  () => {
    if (!configStore.enableCsat) return;
    loadAgentsData();
    if (!activeAgentEmail.value) {
      loadRatingsData();
    } else activeAgentEmail.value = null;
  },
  { deep: true },
);

watch(
  () => humanSupportMonitoringStore.refreshDataMonitoring,
  (value) => {
    if (!configStore.enableCsat) return;
    if (value) {
      agentsTotalNext.value = null;
      activeAgentEmail.value = null;
      loadAgentsData();
      if (!activeAgentEmail.value) {
        loadRatingsData();
      } else activeAgentEmail.value = null;
    }
  },
);
</script>

<style scoped lang="scss">
.csat-ratings-widget {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;
  width: 100%;
  padding: $unnnic-space-6;

  border-radius: $unnnic-spacing-xs;
  border: 1px solid $unnnic-color-border-soft;
  background: $unnnic-color-neutral-white;

  &__title {
    color: $unnnic-color-neutral-darkest;
    font: $unnnic-font-display-2;
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $unnnic-space-12;
  }

  &__agents {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
    width: 100%;
    max-height: 365px;
    overflow-y: auto;
    overflow-x: clip;
  }

  &__ratings {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    &-loading {
      display: grid;
    }
  }

  &__agent-card {
    margin-right: $unnnic-space-1;
  }
}
</style>
