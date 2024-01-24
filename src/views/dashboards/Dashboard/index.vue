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
        />
        <section class="dashboard__subheader-description">
          <h1 class="dashboard__title">Atendimento Humano</h1>
          <p class="dashboard__description">Nome do projeto</p>
        </section>
        <unnnic-icon icon="close" size="md" scheme="neutral-black" clickable />
      </section>
      <section class="dashboard__buttons">
        <section>
          <unnnic-input-date-picker
            v-model="filterDate"
            position="left"
            size="md"
          />
          <unnnic-button
            text="Filtros"
            icon-left="filter_alt"
            type="tertiary"
            size="large"
          />
        </section>
        <unnnic-select-smart
          v-model="filterValue"
          :options="filterOptions"
          placeholder="Exportar"
          type="tertiary"
        />
      </section>
    </header>
  </insights-layout>
</template>

<script>
import InsightsLayout from '@/layouts/InsightsLayout/index.vue';

export default {
  name: 'DashboardView',

  components: {
    InsightsLayout,
  },

  data: () => ({
    filterDate: {
      start: null,
      end: null,
    },
    filterValue: [],
    filterOptions: [
      {
        value: '',
        label: 'Exportar',
      },
      {
        value: '1',
        label: 'Exportar em CSV',
      },
      {
        value: '2',
        label: 'Exportar em PDF',
      },
    ],
    breadcrumb: [
      {
        name: 'Insights',
      },
      {
        name: 'Dashboards',
      },
      {
        name: 'Atendimento Humano',
      },
    ],
  }),
};
</script>

<style lang="scss" scoped>
.dashboard {
  &__header {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-lg;
  }
  &__subheader {
    display: flex;
    align-items: flex-start;
    align-self: stretch;
    gap: $unnnic-spacing-ant;
    margin-bottom: $unnnic-spacing-lg;
  }
  &__subheader-description {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: $unnnic-spacing-nano;
    width: 100%;
  }
  &__title {
    font-size: $unnnic-font-size-title-lg;
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
}
</style>
