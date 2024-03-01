<template>
  <insights-layout ref="insights-layout">
    <header class="dashboard__header">
      <unnnic-breadcrumb :crumbs="breadcrumb" @crumbClick="handleCrumbClick" />
      <section class="dashboard__subheader">
        <unnnic-icon
          icon="arrow_back"
          size="lg"
          scheme="neutral-black"
          clickable
          @click="goToDashboards"
        />
        <section class="dashboard__subheader-description">
          <h1 class="dashboard__title">{{ dashboardTitle }}</h1>
          <p class="dashboard__description">Nome do projeto</p>
        </section>
        <unnnic-icon
          icon="close"
          size="md"
          scheme="neutral-black"
          clickable
          @click="goToDashboards"
        />
      </section>
      <section class="dashboard__buttons">
        <section class="dashboard__buttons-one">
          <button class="dashboard__button">
            <unnnic-icon icon="calendar_month" size="md" clickable />
            <span class="dashboard__button-title">Hoje</span>
            <unnnic-icon icon="expand_more" size="md" clickable />
          </button>
          <button class="dashboard__button">
            <unnnic-icon icon="filter_alt" size="md" clickable />
            <span class="dashboard__button-title">Filtros</span>
          </button>
        </section>
        <unnnic-dropdown>
          <template #trigger>
            <button class="dashboard__button">
              <span class="dashboard__button-title">Exportar</span>
              <unnnic-icon icon="expand_more" size="md" clickable />
            </button>
          </template>

          <unnnic-dropdown-item>
            <span @click="downloadCSV">
              <p class="dashboard__dropdown-item">Exportar em CSV</p>
            </span>
          </unnnic-dropdown-item>
          <unnnic-dropdown-item>
            <span @click="downloadPDF">
              <p class="dashboard__dropdown-item">Exportar em PDF</p>
            </span>
          </unnnic-dropdown-item>
        </unnnic-dropdown>
      </section>
    </header>
    <section class="dashboard__widgets" v-if="firstSection">
      <section class="dashboard__widgets-cards">
        <article
          class="dashboard__widgets-card"
          @click="showTable"
          v-for="(card, index) in cards"
          :key="index"
        >
          <h4 class="dashboard__widgets-card-title">{{ card.title }}</h4>
          <p class="dashboard__widgets-card-description">
            {{ card.description }}
          </p>
        </article>
      </section>
      <section class="dashboard__widgets-chart">
        <ColumnCharts
          :chartData="chartData"
          :height="chartHeight"
          :width="chartWidth"
        />
      </section>
      <section class="dashboard__widgets-agent">
        <AgentChats />
      </section>
    </section>
    <section v-else class="dashboard__table">
      <TableChats :data="chatsData" />
    </section>
  </insights-layout>
</template>

<script>
import InsightsLayout from '@/layouts/InsightsLayout/index.vue';
import InsightsCard from '@/components/InsightsCard.vue';
import ColumnCharts from '@/components/ColumnCharts.vue';
import AgentChats from '@/components/AgentChats.vue';
import TableChats from '@/components/TableChats.vue';
import dashboardData from '@/mocks/dashboardData.json';
import chartData from '@/mocks/chartData.json';
import ChatsData from '@/mocks/chats.json';

export default {
  name: 'DashboardView',

  components: {
    InsightsLayout,
    InsightsCard,
    ColumnCharts,
    AgentChats,
    TableChats,
  },

  data: () => ({
    dashboardTitle: '',
    cards: dashboardData,
    chartData: chartData,
    chatsData: ChatsData,
    firstSection: true,
    chartHeight: '100%',
    chartWidth: '100%',
    breadcrumb: [
      {
        name: 'Insights',
        path: '/insights',
      },
      {
        name: 'Dashboards',
        path: '/dashboards',
      },
      {
        name: '',
        path: '',
      },
    ],
  }),
  methods: {
    goToDashboards() {
      this.$router.push({ name: 'dashboards' });
    },
    handleCrumbClick(crumb) {
      this.$router.push(crumb.path);
    },
    showTable() {
      this.firstSection = !this.firstSection;
    },
    handleCrumbClick(crumb) {
      this.$router.push(crumb.path);
    },
    downloadCSV() {
      const link = document.createElement('a');
      link.href = '/src/files/arquivo_teste.csv';
      link.setAttribute('download', 'arquivo_teste.csv');
      link.click();
    },
    downloadPDF() {
      const link = document.createElement('a');
      link.href = '/src/files/arquivo_teste.pdf';
      link.setAttribute('download', 'arquivo_teste.pdf');
      link.click();
    },
  },
  mounted() {
    const cardTitle = this.$route.query.title;
    const cardId = this.$route.params.id;
    const cardPath = `/dashboards/${cardId}`;
    this.dashboardTitle = cardTitle;

    this.breadcrumb[2].name = cardTitle;
    this.breadcrumb[2].path = cardPath;
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
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
  }
  &__subheader-description {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: $unnnic-spacing-nano;
  }
  &__title {
    font-size: $unnnic-font-size-title-md;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }
  &__separator {
    border: 1px solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-spacing-nano;
    height: 1px;
  }
  &__templates-title {
    margin-top: $unnnic-spacing-sm;
  }
  &__buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $unnnic-spacing-xs;
    place-content: space-between;
  }
  &__buttons-one {
    display: flex;
    flex-direction: row;
    gap: $unnnic-spacing-xs;
  }
  &__button {
    background-color: $unnnic-color-neutral-lightest;
    border: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $unnnic-spacing-xs;
    padding: $unnnic-spacing-xs;
    cursor: pointer;
  }
  &__button-title {
    font-size: $unnnic-font-size-body-lg;
  }
  &__dropdown-item {
    width: max-content;
  }
  &__widgets {
    height: 100%;

    margin-top: $unnnic-spacing-sm;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    grid-template-rows: repeat(3, 1fr);
    gap: $unnnic-spacing-md;
    grid-template-areas:
      'cards cards graph'
      'cards cards agents'
      'cards cards agents';
  }
  &__widgets-cards {
    grid-area: cards;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: $unnnic-spacing-sm;
    grid-column: span 2;
  }
  &__widgets-chart {
    height: 18vh;
    grid-area: graph;
  }

  &__widgets-agent {
    grid-area: agents;
  }
  &__widgets-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    text-align: right;
    justify-content: center;
    background-color: $unnnic-color-neutral-lightest;
    gap: $unnnic-spacing-sm;
    padding: $unnnic-spacing-md;
    border-radius: $unnnic-border-radius-sm;
    cursor: pointer;
  }

  &__widgets-card-title {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-h4;
    font-weight: 700;
    font-family: $unnnic-font-family-primary;
  }
  &__widgets-card-description {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-lg;
  }
  &__table {
    height: 100%;

    margin-top: $unnnic-spacing-sm;
  }
}
</style>
