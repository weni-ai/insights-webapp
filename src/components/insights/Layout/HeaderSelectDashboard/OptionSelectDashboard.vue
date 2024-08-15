<template>
  <UnnnicDropdownItem
    data-testid="option-select-dashboard"
    class="option-select-dashboard"
    :class="{
      'option-select-dashboard--active':
        currentDashboard.uuid === dashboard.uuid,
    }"
    @click="setCurrentDashboard(dashboard)"
  >
    {{ dashboard.name }}
    <UnnnicIcon
      data-testid="star-icon"
      class="option-select-dashboard__star-icon"
      :class="{
        'option-select-dashboard__star-icon--selected': isDefaultDashboard,
      }"
      icon="star_rate"
      scheme="neutral-clean"
      clickable
      :filled="isDefaultDashboard || starHovered"
      @mouseenter="setStarHovered(true)"
      @mouseleave="setStarHovered(false)"
      @click.stop="handleSetDefaultDashboard"
    />
  </UnnnicDropdownItem>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import Unnnic from '@weni/unnnic-system';

export default {
  name: 'OptionSelectDashboard',

  props: {
    dashboard: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      dashboardHovered: '',
      starHovered: false,
    };
  },

  computed: {
    ...mapState({
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),

    isDefaultDashboard() {
      return this.dashboardDefault?.uuid === this.dashboard.uuid;
    },
  },

  methods: {
    ...mapActions({
      setCurrentDashboard: 'dashboards/setCurrentDashboard',
      setDefaultDashboard: 'dashboards/setDefaultDashboard',
    }),

    setStarHovered(boolean) {
      this.starHovered = boolean;
    },

    async handleSetDefaultDashboard() {
      const { dashboard } = this;
      if (dashboard.uuid === this.dashboardDefault.uuid) return;

      try {
        await this.setDefaultDashboard(dashboard.uuid);
        this.callSetDashboardAlert('success');
      } catch (error) {
        console.error(error);
        this.callSetDashboardAlert('error');
      }
    },

    callSetDashboardAlert(type) {
      const { dashboard } = this;

      if (!['success', 'error'].includes(type)) {
        throw new Error(
          'Error calling the alert when setting the default dashboard. This type does not exist.',
        );
      }

      Unnnic.unnnicCallAlert({
        props: {
          text: this.$t(`insights_header.set_default_dashboard_${type}`, {
            dashboard: dashboard.name,
          }),
          type,
        },
        seconds: 5,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.option-select-dashboard {
  &.unnnic-dropdown-item::before {
    content: none;
  }

  border-radius: $unnnic-border-radius-sm;

  padding: $unnnic-spacing-xs;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $unnnic-spacing-nano;

  color: $unnnic-color-neutral-darkest;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;

  &--active {
    background-color: $unnnic-color-neutral-lightest;
    font-weight: $unnnic-font-weight-bold;
  }

  .option-select-dashboard__star-icon:not(
      .option-select-dashboard__star-icon--selected
    ):hover {
    color: $unnnic-color-weni-500;
  }

  .option-select-dashboard__star-icon--selected {
    color: $unnnic-color-weni-600;
  }
}
</style>
