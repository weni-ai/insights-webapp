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
        <section class="operational-alerts-button__trigger">
          <UnnnicButton
            type="tertiary"
            size="large"
            :pressed="isPopoverOpen"
            iconCenter="more_vert"
            data-testid="operational-alerts-trigger"
            :disabled="!hasSectorsConfigured"
          />
          <UnnnicTag
            v-if="!hasOpenedDrawer"
            class="operational-alerts-button__new-tag"
            data-testid="operational-alerts-new-tag"
            :text="$t('operational_alerts.popover.new_tag')"
            scheme="aux-blue"
            size="small"
            type="default"
          />
        </section>
      </UnnnicPopoverTrigger>
      <UnnnicPopoverContent size="small">
        <section
          class="operational-alerts-button__option"
          data-testid="operational-alerts-option"
          @click="handleOpenDrawer"
        >
          <UnnnicIcon
            icon="settings"
            size="sm"
            scheme="fg-emphasized"
          />
          <p class="operational-alerts-button__option-label">
            {{ $t('operational_alerts.popover.option_label') }}
          </p>
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
const { loadGoals, setHasSeenPopover, setHasOpenedDrawer } = metricGoalsStore;

const isPopoverOpen = ref(false);
const showDrawer = ref(false);

const handlePopoverToggle = (open: boolean) => {
  isPopoverOpen.value = open;
  if (!open && !hasSeenPopover.value) {
    setHasSeenPopover(true);
  }
};

const handleOpenDrawer = async () => {
  isPopoverOpen.value = false;
  setHasSeenPopover(true);
  try {
    await loadGoals();
  } finally {
    showDrawer.value = true;
  }
};

const handleCloseDrawer = () => {
  showDrawer.value = false;
  setHasOpenedDrawer(true);
};

onMounted(() => {
  if (!hasSeenPopover.value) {
    isPopoverOpen.value = true;
  }
});
</script>

<style scoped lang="scss">
.operational-alerts-button {
  display: flex;

  &__trigger {
    position: relative;
    display: inline-flex;
  }

  &__new-tag {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 1;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

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
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-emphasis;
    white-space: nowrap;
  }
}
</style>
