<template>
  <section class="dashboard-flow-results">
    <section class="dashboard-flow-results__cards">
      <CardBase class="cards__insight-card">
        <h2 class="insight-card__title">💡 Insight</h2>
        <p class="insight-card__description">
          Configure os Cards de métricas de acordo com as necessidades do seu
          projeto para obter Insights
        </p>
      </CardBase>
      <CardDashboard
        v-for="card of 5"
        :key="card"
        configurable
      />
    </section>
    <CardFunnel
      class="dashboard-flow-results__funnel"
      :isLoading="isLoading"
      :chartData="chartData"
    />
  </section>
</template>

<script>
import CardBase from '@/components/insights/cards/CardBase.vue';
import ChatsData from '@/mocks/chats.json';
import CardFunnel from '@/components/insights/cards/CardFunnel.vue';
import CardDashboard from '@/components/insights/cards/CardDashboard.vue';
export default {
  name: 'DashboardFlowResults',
  components: {
    CardBase,
    CardDashboard,
    CardFunnel,
  },
  data: () => ({
    isLoading: false,
    chartData: {
      labels: ['Step 1', 'Step 2', 'Step 3'],
      datasets: [
        {
          data: [1, 0.75, 0.5],
        },
      ],
    },
    chatsData: ChatsData,
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
.dashboard-flow-results {
  height: 100%;

  display: grid;
  gap: $unnnic-spacing-md;
  grid-template-columns: 8fr 4fr;
  grid-template-areas: 'cards funnel';

  &__cards {
    overflow: hidden;

    grid-area: cards;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: $unnnic-spacing-sm;

    height: 100%;

    .cards__insight-card {
      padding: $unnnic-spacing-sm;

      display: flex;
      flex-direction: column;
      justify-content: center;

      .insight-card {
        display: flex;
        flex-direction: column;
        gap: $unnnic-spacing-xs;

        &__title {
          color: $unnnic-color-neutral-cloudy;
          font-family: $unnnic-font-family-primary;
          font-size: $unnnic-font-size-body-lg;
          font-weight: $unnnic-font-weight-bold;
          line-height: $unnnic-line-height-small * 6;
        }

        &__description {
          color: $unnnic-color-neutral-cloudy;
          font-size: $unnnic-font-size-body-gt;
          line-height: $unnnic-line-height-small * 5.5;
        }
      }
    }
  }

  &__funnel {
    grid-area: funnel;
  }
}
</style>
