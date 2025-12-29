<template>
  <UnnnicDropdownItem
    data-testid="option-select-dashboard"
    class="option-select-dashboard"
    :class="{
      'option-select-dashboard--active':
        currentDashboard.uuid === dashboard.uuid,
    }"
    @click="handleSetCurrentDashboard(dashboard)"
  >
    <section class="option-select-dashboard__content">
      {{ $t(dashboard.name) }}
      <BetaText v-if="isRenderBetaText" />
    </section>

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
import { mapActions, mapState } from 'pinia';
import { useDashboards } from '@/store/modules/dashboards';

import Unnnic from '@weni/unnnic-system';
import BetaText from './BetaText.vue';

export default {
  name: 'OptionSelectDashboard',

  components: {
    BetaText,
  },

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
    ...mapState(useDashboards, ['currentDashboard', 'dashboardDefault']),
    isDefaultDashboard() {
      return this.dashboardDefault?.uuid === this.dashboard.uuid;
    },
    isRenderBetaText() {
      const isConversational =
        this.dashboard.name === 'conversations_dashboard.title';
      return isConversational;
    },
  },

  methods: {
    ...mapActions(useDashboards, [
      'setCurrentDashboard',
      'setDefaultDashboard',
    ]),

    handleSetCurrentDashboard(dashboard) {
      const route = this.$route;

      if (route.name === 'report') {
        this.$router.push({
          name: 'dashboard',
          params: {
            dashboardUuid: dashboard.uuid,
          },
        });
        return;
      }

      this.setCurrentDashboard(dashboard);
    },

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

  &__content {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-nano;
  }

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
