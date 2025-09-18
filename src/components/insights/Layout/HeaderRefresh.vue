<template>
  <UnnnicButton
    data-testid="refresh-button"
    :text="$t('insights_header.refresh')"
    type="tertiary"
    iconLeft="refresh"
    :disabled="isLoadingData"
    @click="refreshData"
  />
</template>

<script setup lang="ts">
import { UnnnicButton } from '@weni/unnnic-system';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { storeToRefs } from 'pinia';

const useMonitoring = useHumanSupportMonitoring();

const { isLoadingData } = storeToRefs(useMonitoring);
const { loadData } = useMonitoring;

const refreshData = () => {
  loadData();
};
</script>
