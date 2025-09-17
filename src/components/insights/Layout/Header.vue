<template>
  <header
    v-if="currentDashboard"
    class="insights-layout-header"
    data-testid="insights-layout-header"
  >
    <UnnnicBreadcrumb
      v-if="!isExpansiveMode"
      :crumbs="breadcrumbs"
      @crumb-click="
        $router.push({ name: $event.routeName, path: $event.routePath })
      "
    />
    <section
      v-if="!isExpansiveMode"
      class="insights-layout-header__content"
      data-testid="insights-layout-header-content"
    >
      <HeaderSelectDashboard v-if="!isExpansiveMode" />

      <section
        v-if="!isExpansiveMode"
        class="content__actions"
      >
        <HeaderTagLive
          v-if="showTagLive"
          data-testid="insights-layout-header-tag-live"
        />
        <InsightsLayoutHeaderFilters
          v-if="currentDashboardFilters.length"
          data-testid="insights-layout-header-filters"
        />
        <HeaderDashboardSettings />
        <HeaderGenerateInsightButton
          v-if="isRenderInsightButton"
          data-testid="insights-layout-header-generate-insight-button"
        />
        <HumanSupportExport v-if="isRenderHumanSupportBtnExport" />
        <ConversationalExport v-if="isRenderConversationalBtnExport" />
      </section>
    </section>
    <section
      v-if="isExpansiveMode"
      class="insights-layout-header__expansive"
      data-testid="insights-layout-header-expansive"
    >
      <p
        class="insights-layout-header__expansive-title"
        data-testid="insights-layout-header-expansive-title"
      >
        {{ $t('human_service_dashboard.all_agents') }}
      </p>
      <UnnnicButtonIcon
        icon="close"
        size="small"
        type="tertiary"
        class="insights-layout-header__expansive-close"
        @click="setCurrentExpansiveWidget({})"
      />
    </section>
  </header>
</template>

<script>
import { mapActions, mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';

import HeaderSelectDashboard from './HeaderSelectDashboard/index.vue';
import HeaderTagLive from './HeaderTagLive.vue';
import InsightsLayoutHeaderFilters from './HeaderFilters/index.vue';
import HeaderDashboardSettings from './HeaderDashboardSettings.vue';
import HeaderGenerateInsightButton from './HeaderGenerateInsights/HeaderGenerateInsightButton.vue';
import HumanSupportExport from '../export/HumanSupportExport.vue';
import ConversationalExport from '../export/ConversationalExport.vue';

import moment from 'moment';

export default {
  name: 'InsightsLayoutHeader',

  components: {
    HeaderSelectDashboard,
    HeaderTagLive,
    InsightsLayoutHeaderFilters,
    HeaderDashboardSettings,
    HeaderGenerateInsightButton,
    HumanSupportExport,
    ConversationalExport,
  },
  computed: {
    ...mapState(useDashboards, [
      'dashboards',
      'currentDashboard',
      'dashboardDefault',
      'currentDashboardFilters',
      'appliedFilters',
      'exportData',
    ]),
    ...mapState(useWidgets, {
      isExpansiveMode: (store) => {
        const currentExpansiveWidget = store.currentExpansiveWidget;
        return (
          currentExpansiveWidget &&
          Object.keys(currentExpansiveWidget).length > 0
        );
      },
    }),

    isRenderInsightButton() {
      return this.isHumanServiceDashboard;
    },

    isRenderHumanSupportBtnExport() {
      return this.isHumanServiceDashboard;
    },
    // TODO: change to isConversationalDashboard when the API is ready
    isRenderConversationalBtnExport() {
      return false;
    },

    isHumanServiceDashboard() {
      return this.currentDashboard?.name === 'human_service_dashboard.title';
    },

    isConversationalDashboard() {
      return this.currentDashboard?.name === 'conversations_dashboard.title';
    },

    breadcrumbs() {
      const { currentDashboard } = this;
      const { dashboardUuid } = this.$route.params;

      const crumbs = [
        {
          path: currentDashboard.uuid,
          routeName: 'dashboard',
          name: `Insights ${this.$t(currentDashboard.name || '')}`,
        },
      ];

      if (this.$route.name === 'report') {
        crumbs[1] = {
          path: this.$route.path,
          routePath: 'report',
          name: `${this.$t('report')} ${this.$t(currentDashboard.name || '')}`,
        };
      }

      return dashboardUuid === currentDashboard.uuid ? crumbs : [];
    },

    showTagLive() {
      const dateFilter = this.currentDashboardFilters.find(
        (filter) => filter.type === 'date_range',
      );

      const { query } = this.$route;
      const today = moment().format('YYYY-MM-DD');

      const filteringDateValues = Object.values(
        this.appliedFilters[dateFilter?.name] || {},
      );

      const isFilteringToday = filteringDateValues.every(
        (filterDate) => filterDate === today,
      );

      return !query[dateFilter?.name] || isFilteringToday;
    },
  },

  watch: {
    currentDashboard(_newCurrentDashboard, oldCurrentDashboard) {
      if (oldCurrentDashboard?.uuid) {
        this.navigateToDashboard(this.currentDashboard.uuid);
      }
    },
    $route(newRoute, oldRoute) {
      const { dashboardUuid: newUuid } = newRoute.params;
      const { dashboardUuid: oldUuid } = oldRoute.params;

      if (newUuid !== oldUuid) {
        this.routeUpdateCurrentDashboard();
      }
    },
  },

  mounted() {
    this.routeUpdateCurrentDashboard();
  },

  methods: {
    ...mapActions(useWidgets, {
      setCurrentExpansiveWidget: 'setCurrentExpansiveWidgetData',
    }),
    ...mapActions(useDashboards, ['setCurrentDashboard']),

    navigateToDashboard(uuid) {
      this.$router.replace({
        name: 'dashboard',
        params: { dashboardUuid: uuid },
      });
    },

    goToDefaultDashboard() {
      const { uuid } = this.dashboardDefault;
      this.navigateToDashboard(uuid);
    },

    routeUpdateCurrentDashboard() {
      const { dashboardUuid } = this.$route.params;

      const dashboardRelativeToPath = this.dashboards.find(
        ({ uuid }) => dashboardUuid === uuid,
      );

      if (!dashboardRelativeToPath) {
        this.goToDefaultDashboard();
      }

      this.setCurrentDashboard(
        dashboardRelativeToPath || this.dashboardDefault,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.insights-layout-header {
  display: grid;
  gap: $unnnic-spacing-sm;

  &__content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: $unnnic-spacing-xs;

    .content__actions {
      display: flex;
      gap: $unnnic-spacing-ant;
    }
  }
  &__expansive {
    border-radius: 0.5rem 0.5rem 0rem 0rem;
    background: $unnnic-color-neutral-white;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: $unnnic-spacing-xs $unnnic-spacing-md;

    &-title {
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-black;
      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-primary;
      line-height: $unnnic-font-size-title-sm + $unnnic-line-height-md;
    }

    &-close {
      background-color: $unnnic-color-neutral-white;
    }
  }
}
</style>
