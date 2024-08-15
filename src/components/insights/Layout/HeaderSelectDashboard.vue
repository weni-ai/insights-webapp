<template>
  <UnnnicDropdown
    ref="selectDashboard"
    data-onboarding-id="select-dashboard"
    class="header-select-dashboard"
    position="bottom-right"
  >
    <template #trigger>
      <UnnnicAvatarIcon
        v-if="$route.name === 'dashboard'"
        icon="monitoring"
        scheme="aux-purple-500"
      />
      <UnnnicIcon
        v-else
        class="header-select-dashboard__arrow-back"
        icon="arrow_back"
        scheme="neutral-darkest"
        clickable
        @click.stop="$router.back"
      />
      <section
        class="dropdown__trigger"
        @click="handlerDashboardNameClick()"
      >
        <h1 class="trigger__title">
          {{
            currentDashboard.name || dashboardDefault.name || dashboards[0].name
          }}
        </h1>
        <UnnnicIcon icon="expand_more" />
      </section>
    </template>
    <UnnnicDropdownItem
      v-for="dashboard of dashboards"
      :key="dashboard"
      class="header-select-dashboard__item"
      :class="{
        'header-select-dashboard__item--active':
          currentDashboard.uuid === dashboard.uuid,
      }"
      @click="setCurrentDashboard(dashboard)"
      @mouseenter="setDashboardHovered(dashboard.uuid)"
      @mouseleave="setDashboardHovered('')"
    >
      {{ dashboard.name }}
      <UnnnicIcon
        class="item__star-icon"
        :class="{
          'item__star-icon--selected': getIsDefaultDashboard(dashboard.uuid),
        }"
        icon="star_rate"
        scheme="neutral-clean"
        clickable
        :filled="
          getIsDefaultDashboard(dashboard.uuid) ||
          starHovered === dashboard.uuid
        "
        @mouseenter="setStarHovered(dashboard.uuid)"
        @mouseleave="setStarHovered('')"
        @click.stop="handleSetDefaultDashboard(dashboard)"
      />
    </UnnnicDropdownItem>
    <UnnnicDropdownItem
      v-if="enableCreateCustomDashboards"
      data-onboarding-id="create-dashboard-button"
      class="header-select-dashboard__item create-dashboard-section"
      @click="handlerCreateDashboardClick()"
    >
      <UnnnicIcon icon="add" />
      {{ $t('add_new_dashboard') }}
    </UnnnicDropdownItem>
  </UnnnicDropdown>
  <DrawerDashboardConfig
    v-if="showNewDashboardModal"
    v-model="showNewDashboardModal"
    @close="showNewDashboardModal = false"
  />
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex';
import unnnic from '@weni/unnnic-system';
import DrawerDashboardConfig from '../dashboards/DrawerDashboardConfig.vue';

export default {
  name: 'HeaderSelectDashboard',

  components: {
    DrawerDashboardConfig,
  },

  data() {
    return {
      dashboardHovered: '',
      starHovered: '',
      showNewDashboardModal: false,
    };
  },

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
      enableCreateCustomDashboards: (state) =>
        state.config.enableCreateCustomDashboards,
      showCreateDashboardTour: (state) =>
        state.refs.showCreateDashboardOnboarding,
      onboardingRefs: (state) => state.refs.onboardingRefs,
    }),
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),
  },

  mounted() {
    this.$nextTick(() => {
      this.setOnboardingRef({
        key: 'select-dashboard',
        ref: document.querySelector('[data-onboarding-id="select-dashboard"]'),
      });
    });
  },

  methods: {
    ...mapActions({
      setCurrentDashboard: 'dashboards/setCurrentDashboard',
      setDefaultDashboard: 'dashboards/setDefaultDashboard',
    }),

    ...mapMutations({
      setOnboardingRef: 'refs/SET_ONBOARDING_REF',
    }),

    handlerDashboardNameClick() {
      if (!this.showCreateDashboardTour) return;

      setTimeout(() => {
        this.setOnboardingRef({
          key: 'create-dashboard-button',
          ref: document.querySelector(
            '[data-onboarding-id="create-dashboard-button"]',
          ),
        });
        this.onboardingRefs['dashboard-onboarding-tour'].nextStep();
      }, 0);
    },

    handlerCreateDashboardClick() {
      this.showNewDashboardModal = true;
      if (!this.showCreateDashboardTour) return;
      this.onboardingRefs['dashboard-onboarding-tour'].end();
    },

    getIsDefaultDashboard(uuid) {
      return this.dashboardDefault?.uuid === uuid;
    },
    setDashboardHovered(uuid) {
      this.dashboardHovered = uuid;
    },
    setStarHovered(dashboardUuid) {
      this.starHovered = dashboardUuid;
    },
    handleSetDefaultDashboard(dashboard) {
      if (dashboard.uuid === this.dashboardDefault.uuid) return;
      try {
        this.setDefaultDashboard(dashboard.uuid).then(() => {
          unnnic.unnnicCallAlert({
            props: {
              text: `Agora o Dashboard ${dashboard.name} é sua página inicial`,
              type: 'success',
            },
            seconds: 5,
          });
        });
      } catch (error) {
        console.log(error);
        unnnic.unnnicCallAlert({
          props: {
            text: `Falha ao definir o Dashboard "${dashboard.name}" como página inicial`,
            type: 'error',
          },
          seconds: 5,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
$dropdownFixedWidth: 314px;

.header-select-dashboard {
  display: flex;

  .dropdown__trigger {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-nano;

    cursor: pointer;

    .trigger__title {
      margin: $unnnic-spacing-nano 0;

      color: $unnnic-color-neutral-darkest;
      font-family: $unnnic-font-family-primary;
      font-size: $unnnic-font-size-title-sm;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-line-height-large * 2;
    }
  }

  &__item {
    justify-content: space-between;

    &--active {
      background-color: $unnnic-color-neutral-lightest;
      font-weight: $unnnic-font-weight-bold;
    }
  }

  &__arrow-back {
    margin: $unnnic-spacing-xs;
  }

  :deep(.unnnic-dropdown__trigger) {
    display: flex;
    gap: $unnnic-spacing-ant;
    align-items: center;

    .unnnic-dropdown__content {
      margin-top: $unnnic-spacing-nano;

      left: 0;

      width: $dropdownFixedWidth;

      padding: $unnnic-spacing-xs;
      gap: $unnnic-spacing-nano;

      .unnnic-dropdown-item {
        border-radius: $unnnic-border-radius-sm;

        padding: $unnnic-spacing-xs;

        display: flex;
        align-items: center;
        gap: $unnnic-spacing-nano;

        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;

        &.create-dashboard-section {
          border-top: 1px solid $unnnic-color-neutral-light;
          border-radius: 0px;
          justify-content: center;
          padding: $unnnic-spacing-xs;
        }

        .item__star-icon:not(.item__star-icon--selected):hover {
          color: $unnnic-color-weni-500;
        }

        &::before {
          content: none;
        }

        .item__star-icon--selected {
          color: $unnnic-color-weni-600;
        }
      }
    }
  }
}
</style>
