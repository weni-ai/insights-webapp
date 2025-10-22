<template>
  <section class="analysis">
    <StatusCards data-testid="status-cards" />
  </section>
</template>

<script setup lang="ts">
import StatusCards from './StatusCards.vue';
</script>

<style scoped lang="scss">
.analysis {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;
}
</style>
