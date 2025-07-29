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
      @edit="handleOpenDrawer"
    />
    <AddCsatOrNpsWidget
      v-if="type === 'add'"
      @add="handleOpenDrawer"
    />

    <CsatOrNpsDrawer
      v-if="isDrawerOpen"
      :modelValue="isDrawerOpen"
      :type="type === 'add' ? null : type"
      @update:model-value="isDrawerOpen = $event"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProgressWidget from '@/components/insights/widgets/ProgressWidget.vue';
import AddCsatOrNpsWidget from '@/components/insights/conversations/CsatOrNpsWidget/AddCsatOrNpsWidget.vue';
import CsatOrNpsDrawer from '@/components/insights/conversations/CsatOrNpsWidget/CsatOrNpsDrawer.vue';
import env from '@/utils/env';

defineProps<{
  type: 'csat' | 'nps' | 'add';
}>();

const isDev = env('ENVIRONMENT') !== 'production';

const isDrawerOpen = ref(false);

function handleOpenDrawer() {
  isDrawerOpen.value = true;
}
</script>

<style lang="scss" scoped>
.conversational-dynamic-widget {
  position: relative;
}
</style>
