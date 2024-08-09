<template>
  <UnnnicDropdown v-if="currentDashboard.is_editable">
    <template #trigger>
      <UnnnicButton
        type="secondary"
        size="large"
        iconCenter="tune"
      />
    </template>
    <UnnnicDropdownItem @click="showEditDashboard = true">
      {{ $t('edit_dashboard.title') }}
    </UnnnicDropdownItem>
  </UnnnicDropdown>
  <DrawerDashboardConfig
    v-if="showEditDashboard"
    v-model="showEditDashboard"
    :dashboard="currentDashboard"
    @close="showEditDashboard = false"
  />
</template>

<script>
import { mapState } from 'vuex';

import DrawerDashboardConfig from '../dashboards/DrawerDashboardConfig.vue';

export default {
  name: 'HeaderDashboardSettings',
  components: {
    DrawerDashboardConfig,
  },
  data() {
    return {
      showEditDashboard: false,
    };
  },
  computed: {
    ...mapState({
      currentDashboard: (state) => state.dashboards.currentDashboard,
    }),
  },
};
</script>

<style lang="scss" scoped>
$dropdownFixedWidth: 165px;
:deep(.unnnic-dropdown__trigger) {
  .unnnic-dropdown__content {
    margin-top: $unnnic-spacing-nano;
    right: 0;
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

      &::before {
        content: none;
      }
    }
  }
}
</style>
