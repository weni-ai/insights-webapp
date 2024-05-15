<template>
  <section class="home">
    <BarChart
      v-if="contentHeight === 0"
      title="Mensagens trocadas via bot"
      seeMore
      :chartData="chartData"
    />

    <section class="home__cards">
      <DashboardCard
        v-for="{ title, subtitle, click } of cards"
        :key="subtitle"
        :title="title"
        :subtitle="subtitle"
        @click="click"
        configured
      />
    </section>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import BarChart from '@/components/insights/charts/BarChart.vue';
import chartData from '@/mocks/chartData.json';
import DashboardCard from '@/components/DashboardCard.vue';

export default {
  name: 'HomeView',

  components: {
    BarChart,
    DashboardCard,
  },

  data: () => ({
    chartData: chartData,
    cards: [],
  }),

  created() {
    this.cards = [
      {
        title: '2150',
        subtitle: 'Mensagens trocadas via bot',
      },
      {
        title: '503',
        subtitle: 'Atendimentos no Weni Chats',
        click: () => this.goToHumanService(),
      },
      {
        title: '264',
        subtitle: 'Fluxos disparados',
      },
      {
        title: '7000',
        subtitle: 'Execuções de fluxos',
      },
      {
        title: '1500',
        subtitle: 'Contatos ativos',
      },
      {
        title: '129',
        subtitle: 'Erros de IA',
      },
    ];
  },

  computed: {
    ...mapState({
      isChartVisible: (state) => state.sidebar.chartVisible,
      contentHeight: (state) => state.resizableBar.contentHeight,
    }),
  },

  methods: {
    goToDashboards() {
      this.$router.replace({ name: 'dashboards' });
    },
    goToHumanService() {
      this.$router.push({
        name: 'human-service',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.home {
  display: grid;
  gap: $unnnic-spacing-sm;

  &__cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $unnnic-spacing-sm;
  }
}
</style>
