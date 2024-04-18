<template>
  <section class="home">
    <header class="home__header">
      <h1 class="header__title">Insights</h1>
      <section class="header__handlers">
        <UnnnicButton
          text="Dashboards"
          iconLeft="bar_chart_4_bars"
          type="tertiary"
          size="small"
          @click="goToDashboards"
        />
        <UnnnicInputDatePicker
          v-model="filterDate"
          size="sm"
        />
      </section>
    </header>

    <ColumnCharts
      v-if="contentHeight === 0"
      title="Mensagens trocadas via bot"
      seeMore
      :chartData="chartData"
    />

    <section class="home__cards">
      <InsightsCard
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
import moment from 'moment';
import ColumnCharts from '@/components/ColumnCharts.vue';
import chartData from '@/mocks/chartData.json';
import InsightsCard from '@/components/Card.vue';

export default {
  name: 'HomeView',

  components: {
    ColumnCharts,
    InsightsCard,
  },

  data: () => ({
    filterDate: {
      start: moment().subtract(1, 'day').format('YYYY-MM-DD'),
      end: moment().format('YYYY-MM-DD'),
    },
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
        name: 'dashboard',
        params: {
          id: 1,
        },
        query: {
          title: 'Atendimento humano',
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.home {
  display: grid;
  gap: $unnnic-spacing-sm;

  &__header {
    display: grid;
    gap: $unnnic-spacing-sm;

    .header__title {
      color: $unnnic-color-neutral-darkest;
      font-size: $unnnic-font-size-title-md;
      font-weight: $unnnic-font-weight-bold;
      font-family: $unnnic-font-family-primary;
      line-height: $unnnic-line-height-large * 2;
    }
    .header__handlers {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      button {
        display: flex;
        flex-direction: row;
        align-items: center;
        border: none;
        gap: $unnnic-spacing-xs;
        font-size: 16px;
        padding: $unnnic-spacing-xs;
        background-color: $unnnic-color-neutral-lightest;
      }
    }
  }
  &__cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $unnnic-spacing-sm;
  }
}
</style>
