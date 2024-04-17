<template>
  <section class="resizable-bar__cards">
    <InsightsCard>
      <template v-slot:title
        >Quais foram os principais erros no meu chatbot?</template
      >
      <template v-slot:description>Nos últimos 30 dias</template>
    </InsightsCard>
    <InsightsMainCard @click="emitShowMorePromptsSuggestions">
      <template v-slot:description> Visualizar mais prompts prontos</template>
    </InsightsMainCard>
  </section>
</template>

<script>
import InsightsMainCard from '@/components/InsightsMainCard.vue';
import InsightsCard from '@/components/InsightsCard.vue';

export default {
  name: 'ResisableBarCards',

  components: { InsightsMainCard, InsightsCard },

  methods: {
    emitShowMorePromptsSuggestions() {
      this.$emit('show-more-prompts-suggestions');
    },
  },
};
</script>

<style lang="scss" scoped>
.resizable-bar {
  &__cards {
    display: grid;
    grid-template-columns: repeat(2, 2fr);
    grid-column-gap: $unnnic-spacing-xs;
    grid-row-gap: $unnnic-spacing-xs;
  }
}
</style>
