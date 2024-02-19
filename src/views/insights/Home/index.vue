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
    <div class="cards">
      <div class="card">
        <p class="card__title">2150</p>
        <p>Mensagens trocadas via bot</p>
      </div>
      <div class="card">
        <p class="card__title">503</p>
        <p>Atendimentos no Weni Chats</p>
      </div>
      <div class="card">
        <p class="card__title">4.3</p>
        <p>NPS</p>
      </div>
      <div class="card">
        <p class="card__title">7000</p>
        <p>Runs de fluxos</p>
      </div>
      <div class="card">
        <p class="card__title">1500</p>
        <p>Contatos ativos</p>
      </div>
      <div class="card">
        <p class="card__title">129</p>
        <p>Erros</p>
      </div>
    </div>
  </insights-layout>
</template>

<script>
import moment from 'moment';
import InsightsLayout from '@/layouts/InsightsLayout/index.vue';

export default {
  name: 'HomeView',

  components: {
    InsightsLayout,
  },

  data: () => ({
    filterDate: {
      start: moment().subtract(1, 'day').format('YYYY-MM-DD'),
      end: moment().format('YYYY-MM-DD'),
    },
  }),

  methods: {
    goToDashboards() {
      this.$router.replace({ name: 'dashboards' });
    },
    getTime(date) {
      return moment(date).format('HH:mm');
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
    font-size: $unnnic-font-size-title-lg;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }
}

.buttons {
  margin-top: 2rem;
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
  margin-top: 2rem;
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
      color: $unnnic-color-neutral-darkest;
      font-size: 40px;
      font-size: 700;
      font-weight: 700;
    }
  }
}
</style>
