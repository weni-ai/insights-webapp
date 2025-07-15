<template>
  <BaseConversationWidget
    class="most-talked-about-topics"
    :title="$t('conversations_dashboard.most_talked_about_topics.title')"
  >
  </BaseConversationWidget>
</template>

<script setup lang="ts">
import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
</script>

<style lang="scss" scoped>
.most-talked-about-topics {
  min-width: 100%;
  min-height: 380px;
}
</style>
