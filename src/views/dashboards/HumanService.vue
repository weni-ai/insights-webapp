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
      <AgentChats />
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
import AgentChats from '@/components/AgentChats.vue';
import TableChats from '@/components/TableChats.vue';
import humanServiceData from '@/mocks/humanServiceData';
import chartData from '@/mocks/chartDataHumanService.json';
import ChatsData from '@/mocks/chats.json';

export default {
  name: 'DashboardHumanService',

  components: {
    DashboardCard,
    BarChart,
    AgentChats,
    TableChats,
  },

  data: () => ({
    cards: humanServiceData,
    chartData: chartData,
    chatsData: ChatsData,
    firstSection: true,
  }),
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
    }
  }

  &__table {
    margin-top: $unnnic-spacing-sm;
  }
}
</style>
