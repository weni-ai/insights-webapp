<template>
  <UnnnicDropdown v-if="isDashboardEditable">
    <template #trigger>
      <UnnnicButton
        type="secondary"
        size="large"
        iconCenter="tune"
        data-testid="options-dashboard-button"
      />
    </template>
    <UnnnicDropdownItem
      data-testid="edit-dashboard-button"
      @click="showEditDashboard = true"
    >
      {{ $t('edit_dashboard.title') }}
    </UnnnicDropdownItem>
  </UnnnicDropdown>
  <DrawerDashboardConfig
    v-if="showEditDashboard"
    v-model="showEditDashboard"
    :dashboard="currentDashboard"
    data-testid="edit-dashboard-drawer"
    @close="showEditDashboard = false"
  />
</template>

<script>
import { mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';

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
    ...mapState(useDashboards, ['currentDashboard']),
    isDashboardEditable() {
      const isHumanSupportDashboard =
        this.currentDashboard.name === 'human_support_dashboard.title';
      return this.currentDashboard.is_editable && !isHumanSupportDashboard;
    },
  },
};
</script>

<style lang="scss" scoped>
$dropdownFixedWidth: 165px;
:deep(.unnnic-dropdown__trigger) {
  .unnnic-dropdown__content {
    margin-top: $unnnic-space-1;
    right: 0;
    width: $dropdownFixedWidth;
    padding: $unnnic-space-2;
    gap: $unnnic-space-1;

    .unnnic-dropdown-item {
      border-radius: $unnnic-radius-1;

      padding: $unnnic-space-2;

      display: flex;
      align-items: center;
      gap: $unnnic-space-1;

      color: $unnnic-color-gray-12;
      font: $unnnic-font-body;

      &::before {
        content: none;
      }
    }
  }
}
</style>
