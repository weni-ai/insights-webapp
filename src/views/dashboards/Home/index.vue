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
        />
        <section class="dashboards__subheader-description">
          <h1 class="dashboards__title">Nome do projeto</h1>
          <p class="dashboards__description">Dashboards do projeto</p>
        </section>
        <unnnic-icon icon="close" size="md" scheme="neutral-black" clickable />
      </section>
    </header>
    <hr class="dashboards__separator" />
    <section>
      <h1 class="dashboards__templates-title unnnic-font title-sm">
        Templates de Dashboards
      </h1>
    </section>
    <TableChats :data="chatsData" />
  </insights-layout>
</template>

<script>
import InsightsLayout from '@/layouts/InsightsLayout/index.vue';
import TableChats from '@/components/TableChats.vue';
import ChatsData from '@/mocks/chats.json';

export default {
  name: 'DashboardsView',

  components: {
    InsightsLayout,
    TableChats,
  },

  data: () => ({
    breadcrumb: [
      {
        name: 'Insights',
      },
      {
        name: 'Dashboards',
      },
    ],
    chatsData: ChatsData,
  }),
};
</script>

<style lang="scss" scoped>
.dashboards {
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
}
</style>
