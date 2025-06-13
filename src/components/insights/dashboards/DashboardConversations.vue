<template>
  <section class="dashboard-conversations">
    <h1>Dashboard Conversations</h1>
    <section>
      <h2>Conversations</h2>
    </section>
    <section>
      <h2>Conversations</h2>
    </section>
    <section>
      <h2>Conversations</h2>
    </section>
  </section>
  <section v-if="isLoading">Loading...</section>
</template>

<script setup type="ts">
import { ref } from 'vue';

const isLoading = ref(false);
</script>

<style scoped>
.dashboard-conversations {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
