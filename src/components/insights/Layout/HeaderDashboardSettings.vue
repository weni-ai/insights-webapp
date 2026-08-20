<template>
  <UnnnicPopover
    v-if="isDashboardEditable"
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import DrawerDashboardConfig from '../dashboards/DrawerDashboardConfig.vue';

defineOptions({ name: 'HeaderDashboardSettings' });

const dashboardsStore = useDashboards();
const { currentDashboard } = storeToRefs(dashboardsStore);

const openPopover = ref(false);
const showEditDashboard = ref(false);

const isDashboardEditable = computed(() => {
  const isHumanSupportDashboard =
    currentDashboard.value.name === 'human_support_dashboard.title';
  return currentDashboard.value.is_editable && !isHumanSupportDashboard;
});

const handleEditDashboard = () => {
  showEditDashboard.value = true;
  openPopover.value = false;
};

defineExpose({
  openPopover,
  showEditDashboard,
  isDashboardEditable,
  handleEditDashboard,
});
</script>
