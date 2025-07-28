<template>
  <ProgressWidget
    title="CSAT"
    :progressItems="[
      { text: 'Promoters', value: 80 },
      { text: 'Detractors', value: 20 },
      { text: 'Passives', value: 10.2 },
      { text: 'Passives', value: 25.5 },
      { text: 'Passives', value: 10.2 },
    ]"
    footerText="1500 reviews"
    :isLoading="false"
    @tab-change="handleTabChange"
  />
</template>

<script setup lang="ts">
import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';

const handleTabChange = (tab: string) => {
  console.log('tabChange CSAT   ', tab);
};
</script>
