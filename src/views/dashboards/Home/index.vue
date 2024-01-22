<template>
  <insights-layout ref="insights-layout">
    <header class="dashboards__header">
      <unnnic-breadcrumb
        :crumbs="breadcrumb"
        @crumbClick="handleCrumbClick"
      ></unnnic-breadcrumb>
      <div class="dashboards__subheader">
        <unnnic-icon
          icon="arrow-left-1-1"
          size="md"
          scheme="neutral-black"
          clickable
        />
        <div>
          <h1 class="dashboards__title">Nome do projeto</h1>
          <p class="dashboards__description">Dashboards do projeto</p>
        </div>
      </div>
    </header>
    <hr class="dashboards__separator" />
    <section>
      <h1 class="dashboards__templates-title unnnic-font title-sm">
        Templates de Dashboards
      </h1>
    </section>
  </insights-layout>
</template>

<script>
import InsightsLayout from '@/layouts/InsightsLayout/index.vue';

export default {
  name: 'DashboardsView',

  components: {
    InsightsLayout,
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
    align-items: top;
    gap: $unnnic-spacing-sm;
    margin-bottom: $unnnic-spacing-lg;
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
