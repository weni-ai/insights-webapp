<template>
  <section class="dashboard-conversations">
    <TotalConversationsWidget />
    <section class="dashboard-conversations__widget-issues-container">
      <TopicsWidget class="dashboard-conversations__topics-widget" />
      <QueueServiceWidget
        class="dashboard-conversations__queue-service-widget"
      />
    </section>
  </section>
  <section v-if="isLoading">Loading...</section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TotalConversationsWidget from '@/components/insights/widgets/Conversations/TotalConversationsWidget.vue';
import QueueServiceWidget from '@/components/insights/widgets/Conversations/QueueServiceWidget.vue';
import TopicsWidget from '@/components/insights/widgets/Conversations/TopicsWidget.vue';

const isLoading = ref(false);
</script>

<style lang="scss" scoped>
.dashboard-conversations {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__widget-issues-container {
    display: flex;
    gap: $unnnic-spacing-md;
    width: 100%;
    height: 100%;
  }

  &__topics-widget {
    flex: 6;
  }

  &__queue-service-widget {
    flex: 4;
  }
}
</style>
