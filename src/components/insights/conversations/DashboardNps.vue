<template>
  <ProgressWidget
    title="NPS"
    :card="{
      title: 'Current Store',
      value: '-33,6%',
      valueDescription: '(Low)',
      tooltipInfo: 'NPS',
      isLoading: false,
    }"
    :progressItems="[
      { text: 'Promoters', value: 80 },
      { text: 'Detractors', value: 20 },
      { text: 'Passives', value: 0 },
    ]"
    footerText="1500 reviews"
    :isLoading="false"
    @tab-change="handleTabChange"
  />
</template>

<script setup lang="ts">
import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';

const handleTabChange = (tab: string) => {
  console.log('tabChange NPS   ', tab);
};
</script>
