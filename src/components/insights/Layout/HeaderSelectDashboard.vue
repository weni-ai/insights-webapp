<template>
  <UnnnicDropdown
    class="header-select-dashboard"
    position="bottom-right"
  >
    <template #trigger>
      <UnnnicAvatarIcon
        icon="monitoring"
        scheme="aux-purple-500"
      />
      <section class="dropdown__trigger">
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
      @click="setCurrentDashboard(dashboard)"
      @mouseenter="setDashboardHovered(dashboard.uuid)"
      @mouseleave="setDashboardHovered('')"
    >
      <UnnnicIcon
        class="item__star-icon"
        :class="{
          'item__star-icon--selected': getIsDefaultDashboard(dashboard.uuid),
        }"
        icon="star_rate"
        scheme="neutral-clean"
        :filled="
          getIsDefaultDashboard(dashboard.uuid) ||
          dashboardHovered === dashboard.uuid
        "
        @click.stop
      />
      {{ dashboard.name }}
    </UnnnicDropdownItem>
  </UnnnicDropdown>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'HeaderSelectDashboard',

  data() {
    return {
      dashboardHovered: '',
    };
  },

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),
  },

  methods: {
    ...mapActions({
      setCurrentDashboard: 'dashboards/setCurrentDashboard',
    }),

    getIsDefaultDashboard(uuid) {
      return this.dashboardDefault.uuid === uuid;
    },
    setDashboardHovered(uuid) {
      this.dashboardHovered = uuid;
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
        font-weight: $unnnic-font-weight-bold;

        &:hover {
          background-color: $unnnic-color-neutral-lightest;

          .item__star-icon:not(.item__star-icon--selected) {
            color: $unnnic-color-weni-500;
          }
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
