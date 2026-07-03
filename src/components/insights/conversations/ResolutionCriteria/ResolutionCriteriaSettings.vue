<template>
  <UnnnicPopover
    v-if="isVisible"
    :open="openPopover"
    @update:open="openPopover = $event"
  >
    <UnnnicPopoverTrigger asChild>
      <UnnnicButton
        type="tertiary"
        size="large"
        :pressed="openPopover"
        iconCenter="more_vert"
        data-testid="resolution-criteria-settings-button"
      />
    </UnnnicPopoverTrigger>
    <UnnnicPopoverContent>
      <UnnnicPopoverOption
        :label="$t('conversations_dashboard.resolution_criteria.menu_option')"
        icon="edit_square"
        data-testid="resolution-criteria-menu-option"
        @click="handleOpenDrawer"
      />
    </UnnnicPopoverContent>
  </UnnnicPopover>

  <ResolutionCriteriaDrawer />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';

import ResolutionCriteriaDrawer from './ResolutionCriteriaDrawer.vue';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import { useConversational } from '@/store/modules/conversational/conversational';
import { useResolutionCriteria } from '@/store/modules/conversational/resolutionCriteria';

const openPopover = ref(false);

const { isFeatureFlagEnabled } = useFeatureFlag();
const conversationalStore = useConversational();
const { shouldUseMock } = storeToRefs(conversationalStore);

const resolutionCriteriaStore = useResolutionCriteria();

const isVisible = computed(
  () =>
    isFeatureFlagEnabled('insightsResolutionCriteria') && !shouldUseMock.value,
);

const handleOpenDrawer = () => {
  openPopover.value = false;
  resolutionCriteriaStore.openDrawer();
};
</script>
