<template>
  <section
    class="operational-alerts-button"
    data-testid="operational-alerts-button"
  >
    <UnnnicPopover
      :open="isPopoverOpen"
      @update:open="handlePopoverToggle"
    >
      <UnnnicPopoverTrigger>
        <UnnnicButton
          type="tertiary"
          size="large"
          :pressed="isPopoverOpen"
          iconCenter="more_vert"
          data-testid="operational-alerts-trigger"
          :disabled="!hasSectorsConfigured"
        />
      </UnnnicPopoverTrigger>
      <UnnnicPopoverContent>
        <section
          class="operational-alerts-button__option"
          data-testid="operational-alerts-option"
          @click="handleOpenDrawer"
        >
          <UnnnicIcon
            icon="settings"
            size="sm"
            scheme="neutral-cloudy"
          />
          <p class="operational-alerts-button__option-label">
            {{ $t('operational_alerts.popover.option_label') }}
          </p>
          <UnnnicTag
            v-if="!hasOpenedDrawer"
            class="operational-alerts-button__new-tag"
            data-testid="operational-alerts-new-tag"
            :text="$t('operational_alerts.popover.new_tag')"
            scheme="aux-blue"
            type="default"
          />
        </section>
      </UnnnicPopoverContent>
    </UnnnicPopover>

    <OperationalAlertsDrawer
      v-if="showDrawer"
      v-model="showDrawer"
      data-testid="operational-alerts-drawer"
      @close="handleCloseDrawer"
    />
  </section>
</template>

<script setup lang="ts">
import {
  UnnnicButton,
  UnnnicIcon,
  UnnnicPopover,
  UnnnicPopoverTrigger,
  UnnnicPopoverContent,
  UnnnicTag,
} from '@weni/unnnic-system';
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import OperationalAlertsDrawer from '../Monitoring/OperationalAlerts/OperationalAlertsDrawer.vue';

import { useMetricGoals } from '@/store/modules/humanSupport/metricGoals';
import { useProject } from '@/store/modules/project';

const projectStore = useProject();
const { hasSectorsConfigured } = storeToRefs(projectStore);

const metricGoalsStore = useMetricGoals();
const { hasSeenPopover, hasOpenedDrawer } = storeToRefs(metricGoalsStore);
const { loadGoals, loadRecipients, setHasSeenPopover, setHasOpenedDrawer } =
  metricGoalsStore;

const isPopoverOpen = ref(false);
const showDrawer = ref(false);

const handlePopoverToggle = (open: boolean) => {
  isPopoverOpen.value = open;
  if (!open && !hasSeenPopover.value) {
    setHasSeenPopover(true);
  }
};

const handleOpenDrawer = () => {
  showDrawer.value = true;
  isPopoverOpen.value = false;
  setHasSeenPopover(true);
};

const handleCloseDrawer = () => {
  showDrawer.value = false;
  setHasOpenedDrawer(true);
};

onMounted(() => {
  loadGoals();
  loadRecipients();

  if (!hasSeenPopover.value) {
    isPopoverOpen.value = true;
  }
});
</script>

<style scoped lang="scss">
.operational-alerts-button {
  display: flex;

  &__option {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
    padding: $unnnic-space-2;
    border-radius: $unnnic-radius-1;
    cursor: pointer;

    &:hover {
      background-color: $unnnic-color-gray-1;
    }
  }

  &__option-label {
    color: $unnnic-color-gray-12;
    font: $unnnic-font-body;
    white-space: nowrap;
  }

  &__new-tag {
    margin-left: $unnnic-space-1;
  }
}
</style>
