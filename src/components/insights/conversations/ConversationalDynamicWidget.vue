<template>
  <section
    v-if="isDev"
    class="conversational-dynamic-widget"
  >
    <ProgressWidget
      title="CSAT"
      :progressItems="[
        {
          text: '🤩 Very satisfied',
          value: 57,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
        {
          text: '😁 Satisfied',
          value: 25,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
        {
          text: '😐 Neutral',
          value: 12,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
        {
          text: '☹️ Dissatisfied',
          value: 5,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
        {
          text: '😡 Very dissatisfied',
          value: 1,
          color: '#805AD5',
          backgroundColor: '#E9D8FD',
        },
      ]"
      footerText="1500 reviews"
    />
    <AddCsatOrNpsWidget v-if="type === 'add'" />
  </section>
</template>

<script setup lang="ts">
import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import AddCsatOrNpsWidget from '@/components/insights/conversations/AddCsatOrNpsWidget.vue';
import env from '@/utils/env';

defineProps<{
  type: 'csat' | 'nps' | 'add';
}>();

const isDev = env('ENVIRONMENT') !== 'production';
</script>

<style lang="scss" scoped>
.conversational-dynamic-widget {
  position: relative;
}
</style>
