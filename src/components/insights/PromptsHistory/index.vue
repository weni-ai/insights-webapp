<template>
  <section
    class="prompts-history"
    v-if="insights.length"
  >
    <section
      v-for="(insight, index) in insights"
      class="prompts-history__conversation"
      :key="index"
    >
      <PromptHistoryMessage
        title="Você:"
        :content="insight.request"
      />
      <PromptHistoryMessage
        title="InsightsGPT:"
        :content="insight.received"
      />
    </section>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import PromptHistoryMessage from './PromptHistoryMessage.vue';

export default {
  name: 'PromptsHistory',

  components: {
    PromptHistoryMessage,
  },

  computed: {
    ...mapState({
      insights: (state) => state.gpt.insights,
    }),
  },
};
</script>

<style lang="scss" scoped>
.prompts-history {
  display: grid;
  gap: $unnnic-spacing-xl;

  &__conversation {
    display: grid;
    gap: $unnnic-spacing-xl;
  }
}
</style>
