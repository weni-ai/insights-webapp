<template>
  <insights-layout ref="insights-layout">
    <h1 class="insights__title">Insights</h1>
    <div class="buttons">
      <unnnic-button
        text="Dashboards"
        icon-left="bar_chart_4_bars"
        type="tertiary"
        size="small"
        @click="goToDashboards"
      />
      <unnnic-input-date-picker v-model="filterDate" size="sm" />
    </div>
    <section>
      <ColumnCharts
        :chartData="chartData"
        :height="chartHeight"
        :width="chartWidth"
      />
    </section>
    <div class="cards">
      <div class="card">
        <p class="card__title">2150</p>
        <p class="card__description">Mensagens trocadas via bot</p>
      </div>
      <div class="card card--cursor" @click="goToHumanService">
        <p class="card__title">503</p>
        <p class="card__description">Atendimentos no Weni Chats</p>
      </div>
      <div class="card">
        <p class="card__title">4.3</p>
        <p class="card__description">NPS</p>
      </div>
      <div class="card">
        <p class="card__title">7000</p>
        <p class="card__description">Runs de fluxos</p>
      </div>
      <div class="card">
        <p class="card__title">1500</p>
        <p class="card__description">Contatos ativos</p>
      </div>
      <div class="card">
        <p class="card__title">129</p>
        <p class="card__description">Erros</p>
      </div>
    </div>
  </insights-layout>
</template>

<script>
import moment from 'moment';
import InsightsLayout from '@/layouts/InsightsLayout/index.vue';
import ColumnCharts from '@/components/ColumnCharts.vue';
import chartData from '@/mocks/chartData.json';

export default {
  name: 'HomeView',

  components: {
    InsightsLayout,
    ColumnCharts,
  },

  data: () => ({
    filterDate: {
      start: moment().subtract(1, 'day').format('YYYY-MM-DD'),
      end: moment().format('YYYY-MM-DD'),
    },
    chartData: chartData,
    chartHeight: '100%',
    chartWidth: '100%',
  }),

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
.insights {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-stack-xl;

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-title-md;
    font-weight: $unnnic-font-weight-bold;
    font-family: $unnnic-font-family-primary;
  }
}

.buttons {
  margin-top: $unnnic-spacing-sm;
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
.cards {
  margin-top: $unnnic-spacing-sm;
  display: grid;
  grid-template-columns: repeat(3, 3fr);
  grid-template-rows: repeat(2, 3fr);
  grid-column-gap: $unnnic-spacing-sm;
  grid-row-gap: $unnnic-spacing-sm;
  .card {
    background-color: $unnnic-color-neutral-lightest;
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
    text-align: right;
    padding: $unnnic-spacing-md;

    &__title {
      font-size: 40px;
      font-size: 700;
      font-weight: 700;
      font-family: $unnnic-font-family-primary;
      color: $unnnic-color-neutral-darkest;
    }
    &__description {
      color: $unnnic-color-neutral-darkest;
    }
  }

  .card--cursor {
    cursor: pointer;
  }
}
</style>
