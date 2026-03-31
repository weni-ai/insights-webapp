<template>
  <UnnnicPopover
    :open="openPopover"
    @update:open="openPopover = $event"
  >
    <UnnnicPopoverTrigger>
      <UnnnicButton
        type="tertiary"
        size="large"
        :pressed="openPopover"
        iconCenter="more_vert"
        data-testid="options-dashboard-button"
      />
    </UnnnicPopoverTrigger>
    <UnnnicPopoverContent>
      <UnnnicPopoverOption
        :label="$t('edit_dashboard.title')"
        icon="edit_square"
        @click="handleEditDashboard"
      />
    </UnnnicPopoverContent>
  </UnnnicPopover>
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
      openPopover: false,
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
  methods: {
    handleEditDashboard() {
      this.showEditDashboard = true;
      this.openPopover = false;
    },
  },
};
</script>
