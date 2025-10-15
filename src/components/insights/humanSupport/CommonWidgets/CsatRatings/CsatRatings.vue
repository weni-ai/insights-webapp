<template>
  <section class="csat-ratings-widget">
    <h1 class="csat-ratings-widget__title">CSAT</h1>
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
            :active="!activeAgentUuid"
            hiddenAvatar
            @click="activeAgentUuid = null"
          />
          <AgentCard
            v-for="agent in agentsData"
            :key="agent.agent.uuid"
            class="csat-ratings-widget__agent-card"
            :title="agent.agent.name"
            :subtitle="
              $t('human_support_dashboard.csat.agents_ratings_subtitle', {
                rooms: agent.rooms,
                reviews: agent.reviews,
              })
            "
            :rating="agent.avg_rating"
            :active="activeAgentUuid === agent.agent.uuid"
            @click="activeAgentUuid = agent.agent.uuid"
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
import { useInfiniteScroll } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import type {
  AgentsTotalsResponse,
  RatingsResponse,
} from '@/services/api/resources/humanSupport/csat';

import AgentCard from './AgentCard.vue';
import ProgressTable from '@/components/ProgressTable.vue';

import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

import Csat from '@/services/api/resources/humanSupport/csat';

defineOptions({
  name: 'CsatRatings',
});

onMounted(() => {
  loadAgentsData();
  loadRatingsData();
});

const { t } = useI18n();

const humanSupportMonitoring = useHumanSupportMonitoring();

const agentsContainerRef = useTemplateRef<HTMLElement>('agentsContainerRef');

useInfiniteScroll(agentsContainerRef, async () => {
  if (agentsTotalNext.value)
    await loadAgentsData({ silent: true, concat: true });
});

const isLoadingAgentsData = ref(false);
const isLoadingRatingsData = ref(false);

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
  return Object.entries(ratingsData.value).map(([key, value]) => ({
    label: labelMapping[key as keyof typeof labelMapping],
    backgroundColor: '#E9D8FD',
    color: '#805AD5',
    value: value.value,
    description: `${value.value} (${value.full_value})`,
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
    const { general, next, results } = await Csat.getTotalsMonitoring({});
    agentsGeneralTotals.value = general;
    agentsTotalNext.value = next;
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
    const response = await Csat.getRatingsMonitoring({
      agent_uuid: activeAgentUuid.value,
    });
    ratingsData.value = response;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingRatingsData.value = false;
  }
};

const activeAgentUuid = ref<string | null>(null);

watch(activeAgentUuid, () => {
  loadRatingsData();
});

watch(
  () => humanSupportMonitoring.appliedFilters,
  () => {
    loadAgentsData();
    if (!activeAgentUuid.value) {
      loadRatingsData();
    } else activeAgentUuid.value = null;
  },
  { deep: true },
);

watch(
  () => humanSupportMonitoring.refreshDataMonitoring,
  (value) => {
    if (value) {
      agentsTotalNext.value = null;
      activeAgentUuid.value = null;
      loadAgentsData();
      if (!activeAgentUuid.value) {
        loadRatingsData();
      } else activeAgentUuid.value = null;
    }
  },
);
</script>

<style scoped lang="scss">
.csat-ratings-widget {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;
  min-height: 500px;
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
