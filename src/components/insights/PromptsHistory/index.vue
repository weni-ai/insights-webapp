<template>
  <section
    v-if="insights.length"
    class="prompts-history"
  >
    <section
      v-for="(insight, index) in insights"
      :key="index"
      class="prompts-history__conversation"
    >
      <PromptHistoryMessage
        :title="`${$t('you')}:`"
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
