<template>
  <section class="insights-input">
    <input
      v-model="prompt"
      class="insights-input__input"
      type="text"
      placeholder="Peça insights ao InsightsGPT..."
      @keydown.enter="sendGPTPrompt"
    />
    <UnnnicButton
      type="secondary"
      size="large"
      iconCenter="send"
      iconFilled
      next
      @click="sendGPTPrompt"
    />
  </section>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'InsightsInput',

  data() {
    return {
      prompt: '',
    };
  },

  methods: {
    ...mapActions({
      getInsights: 'gpt/getInsights',
    }),
    sendGPTPrompt() {
      const { prompt, getInsights } = this;

      if (prompt) {
        getInsights({ prompt });
        this.prompt = '';
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.insights-input {
  border-radius: $unnnic-spacing-nano;

  padding: $unnnic-spacing-xs;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $unnnic-spacing-xs;

  background-color: $unnnic-color-neutral-lightest;

  &__input {
    outline: none;
    border: none;
    background: transparent;

    width: 100%;
    height: 100%;

    color: $unnnic-color-neutral-cloudy;
  }
}
</style>
