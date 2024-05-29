<template>
  <header class="dashboard__header">
    <UnnnicBreadcrumb
      :crumbs="breadcrumb"
      @crumbClick="handleCrumbClick"
    />
    <section class="dashboard__subheader">
      <UnnnicIcon
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
      <UnnnicIcon
        icon="close"
        size="md"
        scheme="neutral-black"
        clickable
        @click="goToInsights"
      />
    </section>
    <section class="dashboard__buttons">
      <section class="dashboard__buttons-one">
        <button class="dashboard__button">
          <UnnnicIcon
            icon="calendar_month"
            size="md"
            clickable
          />
          <p class="dashboard__button-title">Hoje</p>
          <UnnnicIcon
            icon="expand_more"
            size="md"
            clickable
          />
        </button>
        <button class="dashboard__button">
          <UnnnicIcon
            icon="filter_alt"
            size="md"
            clickable
          />
          <p class="dashboard__button-title">Filtros</p>
        </button>
      </section>
      <UnnnicDropdown>
        <template #trigger>
          <button class="dashboard__button">
            <p class="dashboard__button-title">Exportar</p>
            <UnnnicIcon
              icon="expand_more"
              size="md"
              clickable
            />
          </button>
        </template>

        <UnnnicDropdownItem>
          <p
            @click="downloadCSV"
            class="dashboard__dropdown-item"
          >
            Exportar em CSV
          </p>
        </UnnnicDropdownItem>
        <UnnnicDropdownItem>
          <p
            @click="downloadPDF"
            class="dashboard__dropdown-item"
          >
            Exportar em PDF
          </p>
        </UnnnicDropdownItem>
      </UnnnicDropdown>
    </section>
  </header>
  <section class="dashboard__widgets">
    <section class="dashboard__widgets-chart">
      <h1 class="dashboard__widgets-chart-title">Fluxos</h1>
      <BarChart
        :chartData="chartData"
        :height="chartHeight"
        :width="chartWidth"
      />
    </section>
    <section>
      <article class="dashboard__widgets-insight">
        <h2 class="dashboard__widgets-insight-title">
          <UnnnicAvatarIcon
            icon="emoji_objects"
            scheme="neutral-dark"
          />
          Insight
        </h2>
        <p class="dashboard__widgets-insight-description">
          Você sabia que seus fluxos com o tom de voz mais amigável possuem uma
          taxa de 50% a mais de respostas? Confira aqui quais são eles
        </p>
      </article>
    </section>
    <section>
      <article class="dashboard__widgets-card">
        <h4 class="dashboard__widgets-card-title">500</h4>
        <p class="dashboard__widgets-card-description">Arquivados</p>
      </article>
    </section>
    <section>
      <article class="dashboard__widgets-card">
        <h4 class="dashboard__widgets-card-title">5000</h4>
        <p class="dashboard__widgets-card-description">Fluxos disparados</p>
      </article>
    </section>
    <section>
      <article class="dashboard__widgets-card">
        <h4 class="dashboard__widgets-card-title">2100</h4>
        <p class="dashboard__widgets-card-description">
          Disparos pelo Weni Chats
        </p>
      </article>
    </section>
    <section>
      <article class="dashboard__widgets-card">
        <h4 class="dashboard__widgets-card-title">20</h4>
        <p class="dashboard__widgets-card-description">Falhas</p>
      </article>
    </section>
  </section>
</template>

<script>
import BarChart from '@/components/insights/charts/BarChart.vue';
import chartData from '@/mocks/barChartData.json';
import ChatsData from '@/mocks/chats.json';
export default {
  name: 'FlowTriggerView',
  components: {
    BarChart,
  },
  data: () => ({
    dashboardTitle: 'Disparo de fluxos',
    chartData: chartData,
    chatsData: ChatsData,
    chartWidth: '100%',
    chartHeight: '100%',
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
        name: 'Disparo de fluxos',
        path: '/disparo-fluxos',
      },
    ],
  }),
  methods: {
    goToDashboards() {
      this.$router.push({ name: 'dashboards' });
    },
    goToInsights() {
      this.$router.push({ name: 'home' });
    },
    handleCrumbClick(crumb) {
      this.$router.push(crumb.path);
    },
    showTable() {
      this.firstSection = !this.firstSection;
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
    width: 100%;
    display: grid;
    grid-template-rows: repeat(3, 1fr);
    grid-template-columns: repeat(3, 1fr);
    gap: $unnnic-spacing-sm;
    padding: $unnnic-spacing-sm;
    margin-top: $unnnic-spacing-sm;
    background-color: $unnnic-color-neutral-lightest;
  }
  &__widgets-chart {
    height: 100%;
    grid-area: 1 / 1 / 3 / 3;
    padding: $unnnic-spacing-xs;
    background-color: $unnnic-color-neutral-white;
  }
  &__widgets-chart-title {
    font-size: $unnnic-font-size-title-sm;
    font-weight: $unnnic-font-weight-bold;
    color: $unnnic-color-neutral-darkest;
  }
  &__widgets-insight {
    height: 100%;
    grid-area: 1/3/2/4;
    display: flex;
    flex-direction: column;
    text-align: right;
    justify-content: center;
    background-color: $unnnic-color-neutral-white;
    gap: $unnnic-spacing-sm;
    padding: $unnnic-spacing-md;
    border-radius: $unnnic-border-radius-sm;
  }
  &__widgets-insight-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $unnnic-spacing-ant;
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-title-md;
    font-weight: 700;
    font-family: $unnnic-font-family-primary;
  }
  &__widgets-insight-description {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-lg;
    text-align: start;
  }
  &__widgets-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    text-align: right;
    justify-content: center;
    background-color: $unnnic-color-neutral-white;
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
}
</style>
