<template>
  <insights-layout ref="insights-layout">
    <header class="dashboards__header">
      <unnnic-breadcrumb :crumbs="breadcrumb" @crumbClick="handleCrumbClick" />
      <section class="dashboards__subheader">
        <unnnic-icon
          icon="arrow_back"
          size="lg"
          scheme="neutral-black"
          clickable
          @click="goToInsights"
        />
        <section class="dashboards__subheader-description">
          <h1 class="dashboards__title">Nome do projeto</h1>
          <p class="dashboards__description">Dashboards do projeto</p>
        </section>
        <unnnic-icon
          icon="close"
          size="md"
          scheme="neutral-black"
          clickable
          @click="goToInsights"
        />
      </section>
    </header>
    <hr class="dashboards__separator" />
    <section>
      <h1 class="dashboards__templates-title">Templates de Dashboards</h1>
    </section>
    <section class="dashboards__cards">
      <DashboardCard
        v-for="(card, index) in cards"
        :key="index"
        :route="card.route"
      >
        <template #title>
          {{ card.title }}
        </template>
      </DashboardCard>
    </section>
  </insights-layout>
</template>

<script>
import InsightsLayout from '@/layouts/InsightsLayout/index.vue';
import DashboardCard from '@/components/DashboardsCard.vue';
import cardsData from '@/mocks/dashboards.json';

export default {
  name: 'DashboardsView',

  components: {
    InsightsLayout,
    DashboardCard,
  },

  data: () => ({
    cards: cardsData,
    breadcrumb: [
      {
        name: 'Insights',
        path: '/insights',
      },
      {
        name: 'Dashboards',
        path: '/dashboards',
      },
    ],
  }),

  methods: {
    goToInsights() {
      this.$router.push({ name: 'home' });
    },
    handleCrumbClick(crumb) {
      this.$router.push(crumb.path);
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboards {
  &__header {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }
  &__subheader {
    display: flex;
    align-items: flex-start;
    align-self: stretch;
    gap: $unnnic-spacing-ant;
    margin-bottom: $unnnic-spacing-lg;
  }
  &__subheader-description {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: $unnnic-spacing-nano;
    font-size: $unnnic-font-size-body-gt;
  }
  &__title {
    font-size: $unnnic-font-size-title-md;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-primary;
  }
  &__separator {
    border: 1px solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-spacing-nano;
    height: 1px;
  }
  &__templates-title {
    padding: $unnnic-spacing-sm 0;
    font-size: $unnnic-font-size-title-sm;
    font-family: $unnnic-font-family-primary;
  }
  &__cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: $unnnic-spacing-sm;
  }
}
</style>
