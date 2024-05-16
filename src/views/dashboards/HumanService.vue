<template>
  <section
    class="dashboard-human-service__widgets"
    v-if="firstSection"
  >
    <BarChart
      class="widgets__chart"
      title="Picos de atendimentos abertos"
      seeMore
      :chartData="chartData"
      :isLoading="isLoading"
    />
    <section class="widgets__cards">
      <DashboardCard
        v-for="{ title, subtitle, click } of cards"
        :key="subtitle"
        :title="title"
        :subtitle="subtitle"
        @click="click"
        configured
      />
    </section>
    <section class="widgets__agents">
      <OnlineAgents :isLoading="isLoading" />
    </section>
  </section>
  <section
    v-else
    class="dashboard-human-service__table"
  >
    <TableChats :data="chatsData" />
  </section>
</template>

<script>
import DashboardCard from '@/components/DashboardCard.vue';
import BarChart from '@/components/insights/charts/BarChart.vue';
import OnlineAgents from '@/components/insights/widgets/OnlineAgents.vue';
import TableChats from '@/components/TableChats.vue';
import humanServiceData from '@/mocks/humanServiceData';
import chartData from '@/mocks/chartDataHumanService.json';
import ChatsData from '@/mocks/chats.json';

export default {
  name: 'DashboardHumanService',

  components: {
    DashboardCard,
    BarChart,
    OnlineAgents,
    TableChats,
  },

  data: () => ({
    cards: humanServiceData,
    chartData: chartData,
    chatsData: ChatsData,
    firstSection: true,
    isLoading: false,
  }),

  created() {
    // Temporary code, to simulate a promise
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  },
};
</script>

<style lang="scss" scoped>
.dashboard-human-service {
  &__widgets {
    height: 100%;

    display: grid;
    gap: $unnnic-spacing-md;
    grid-template-columns: 8fr 4fr;
    grid-template-rows: repeat(3, 1fr);
    grid-template-areas:
      'graph agents'
      'cards agents'
      'cards agents';

    .widgets__cards {
      grid-area: cards;
      display: grid;
      gap: $unnnic-spacing-sm;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, min-content);
    }
    .widgets__chart {
      grid-area: graph;

      padding: $unnnic-spacing-ant;

      box-shadow: $unnnic-shadow-level-far;
    }

    .widgets__agents {
      grid-area: agents;

      box-shadow: $unnnic-shadow-level-far;

      border-radius: $unnnic-border-radius-sm;
    }
  }

  &__table {
    margin-top: $unnnic-spacing-sm;
  }
}
</style>
