<template>
  <section v-if="isLoading">Loading...</section>
  <section
    v-else
    class="total-conversations-widget"
  >
    <section class="total-conversations-widget__card">
      <p class="total-conversations-widget__card-title">Total Conversations</p>
      <p class="total-conversations-widget__card-value">100</p>
    </section>
    <CardConversations />
    <CardConversations />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CardConversations from '@/components/insights/cards/CardConversations.vue';

const isLoading = ref(false);
</script>

<style lang="scss" scoped>
.total-conversations-widget {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $unnnic-spacing-ant;
  width: 100%;

  &__card {
    display: flex;
    flex-direction: column;
    padding-left: $unnnic-spacing-md;
    gap: $unnnic-spacing-ant;

    &-title {
      font-weight: $unnnic-font-weight-bold;
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-title-md;
    }

    &-value {
      font-weight: $unnnic-font-weight-bold;
      color: $unnnic-color-neutral-dark;
      font-size: $unnnic-font-size-title-lg;
    }
  }
}
</style>
