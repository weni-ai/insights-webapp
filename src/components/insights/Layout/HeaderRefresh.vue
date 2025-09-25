<template>
  <UnnnicButton
    data-testid="refresh-button"
    :text="$t('insights_header.refresh')"
    type="tertiary"
    iconLeft="refresh"
    :disabled="isLoadingAllData"
    @click="refreshData"
  />
</template>

<script setup lang="ts">
import { UnnnicButton } from '@weni/unnnic-system';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { storeToRefs } from 'pinia';

const useMonitoring = useHumanSupportMonitoring();

const { isLoadingAllData } = storeToRefs(useMonitoring);
const { loadAllData } = useMonitoring;

const refreshData = () => {
  loadAllData();
};
</script>
