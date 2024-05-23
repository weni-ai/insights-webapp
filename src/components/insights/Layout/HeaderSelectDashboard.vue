<template>
  <UnnnicDropdown
    class="header-select-dashboard"
    position="bottom-right"
  >
    <template #trigger>
      <UnnnicAvatarIcon
        v-if="isSelectedDefaultDashboard"
        icon="monitoring"
        scheme="aux-purple-500"
        @click.stop
      />
      <UnnnicIcon
        v-else
        class="clickable"
        icon="arrow_back"
        @click.stop="$router.back"
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
      @click="setCurrentDashboard(dashboard)"
    >
      {{ dashboard.name }}
    </UnnnicDropdownItem>
  </UnnnicDropdown>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'HeaderSelectDashboard',

  computed: {
    ...mapState({
      dashboards: (state) => state.dashboards.dashboards,
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),
    ...mapGetters({
      dashboardDefault: 'dashboards/dashboardDefault',
    }),

    isSelectedDefaultDashboard() {
      return this.currentDashboard.uuid === this.dashboardDefault.uuid;
    },
  },

  methods: {
    ...mapActions({
      setCurrentDashboard: 'dashboards/setCurrentDashboard',
    }),
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
        color: $unnnic-color-neutral-darkest;
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-gt;
        font-weight: $unnnic-font-weight-bold;
        padding: $unnnic-spacing-xs;
        border-radius: $unnnic-border-radius-sm;

        &:hover {
          background-color: $unnnic-color-neutral-lightest;
        }

        &::before {
          content: none;
        }
      }
    }
  }
}
</style>
