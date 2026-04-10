<template>
  <header class="insights-layout-header">
    <UnnnicPageHeader
      v-if="currentDashboard && !isExpansiveMode"
      hideDivider
      class="insights-page-header"
      data-testid="insights-layout-header"
    >
      <template #infos>
        <HeaderSelectDashboard v-if="!isExpansiveMode" />
      </template>
      <template #actions>
        <section class="insights-layout-header__actions">
          <DynamicHeader :dashboardType="dashboardHeaderType" />
        </section>
      </template>
    </UnnnicPageHeader>
    <section
      v-else-if="isExpansiveMode"
      data-testid="insights-layout-header"
    >
      <section
        class="insights-layout-header__expansive"
        data-testid="insights-layout-header-expansive"
      >
        <p
          class="insights-layout-header__expansive-title"
          data-testid="insights-layout-header-expansive-title"
        >
          {{ $t('human_service_dashboard.all_agents') }}
        </p>
        <UnnnicButton
          iconCenter="close"
          size="small"
          type="tertiary"
          class="insights-layout-header__expansive-close"
          @click="setCurrentExpansiveWidget({})"
        />
      </section>
    </section>
  </header>
</template>

<script>
import { mapActions, mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

import HeaderSelectDashboard from './HeaderSelectDashboard/index.vue';
import DynamicHeader from './DynamicHeader.vue';

export default {
  name: 'InsightsLayoutHeader',

  components: {
    HeaderSelectDashboard,
    DynamicHeader,
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
    ...mapState(useHumanSupport, ['activeTab']),
    ...mapState(useWidgets, {
      isExpansiveMode: (store) => {
        const currentExpansiveWidget = store.currentExpansiveWidget;
        return (
          currentExpansiveWidget &&
          Object.keys(currentExpansiveWidget).length > 0
        );
      },
    }),

    isHumanServiceDashboard() {
      return this.currentDashboard?.name === 'human_service_dashboard.title';
    },

    isHumanSupportDashboard() {
      return this.currentDashboard?.name === 'human_support_dashboard.title';
    },

    isConversationalDashboard() {
      return this.currentDashboard?.name === 'conversations_dashboard.title';
    },

    isMetaTemplateDashboard() {
      return this.currentDashboard?.config?.is_whatsapp_integration;
    },

    dashboardHeaderType() {
      if (this.isConversationalDashboard) {
        return 'conversational';
      }

      if (this.isHumanSupportDashboard) {
        return 'human_support';
      }

      if (this.isMetaTemplateDashboard) {
        return 'metaTemplateMessage';
      }

      if (this.isHumanServiceDashboard) {
        return 'human_service';
      }

      return 'custom';
    },

    breadcrumbs() {
      const { currentDashboard } = this;
      const { dashboardUuid } = this.$route.params;

      const crumbs = [
        {
          path: currentDashboard.uuid,
          routeName: 'dashboard',
          name: `Analytics ${this.$t(currentDashboard.name || '')}`,
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
$dropdownFixedWidth: 314px;
.insights-layout-header {
  :deep(.insights-page-header) {
    grid-template-columns: $dropdownFixedWidth 1fr;
    padding-bottom: 0;
  }
  &__actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: $unnnic-space-3;
  }
  &__expansive {
    border-radius: 0.5rem 0.5rem 0rem 0rem;
    background: $unnnic-color-gray-0;
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: $unnnic-space-2 $unnnic-space-6;

    &-title {
      font: $unnnic-font-display-2;
      font-weight: 900;
      color: $unnnic-color-gray-12;
    }

    &-close {
      background-color: $unnnic-color-gray-0;
    }
  }
}
</style>
