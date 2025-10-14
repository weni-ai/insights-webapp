<template>
  <section class="csat-ratings-widget">
    <h1 class="csat-ratings-widget__title">CSAT</h1>
    <section class="csat-ratings-widget__content">
      <section class="csat-ratings-widget__agents">
        <template v-if="!isLoadingAgentsData">
          <AgentCard
          class="csat-ratings-widget__agent-card"
          :title="$t('human_support_dashboard.csat.agents_ratings_general_title')"
          :subtitle="$t('human_support_dashboard.csat.agents_ratings_subtitle', { rooms: agentsGeneralTotals.rooms, reviews: agentsGeneralTotals.reviews })"
          :tooltip="$t('human_support_dashboard.csat.agents_ratings_general_tooltip')"
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
          :subtitle="$t('human_support_dashboard.csat.agents_ratings_subtitle', { rooms: agent.rooms, reviews: agent.reviews })"
          :rating="agent.avg_rating"
          :active="activeAgentUuid === agent.agent.uuid"
          @click="activeAgentUuid = agent.agent.uuid"
        />
        </template>
      </section>
      <section class="csat-ratings-widget__ratings"></section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import type {
  AgentsTotalsResponse,
  RatingsResponse,
} from '@/services/api/resources/humanSupport/csat';

import AgentCard from './AgentCard.vue';

import Csat from '@/services/api/resources/humanSupport/csat';

defineOptions({
  name: 'CsatRatings',
});

onMounted(() => {
  loadAgentsData();
  loadRatingsData();
})

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

const loadAgentsData = async () => {
  isLoadingAgentsData.value = true;
  try {
    const { general, next, results } = await Csat.getTotalsMonitoring({});
    agentsGeneralTotals.value = general;
    agentsTotalNext.value = next;
    agentsData.value = results;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingAgentsData.value = false;
  }
};

const loadRatingsData = async () => {
  isLoadingRatingsData.value = true;
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

  &__agent-card {
    margin-right: $unnnic-space-1;
  }
}
</style>
