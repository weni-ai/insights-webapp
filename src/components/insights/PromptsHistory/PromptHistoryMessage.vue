<template>
  <section class="prompt-history-message">
    <p class="prompt-history-message__title">{{ title }}</p>
    <p class="prompt-history-message__content">{{ content }}</p>
  </section>
</template>

<script>
export default {
  name: 'PromptHistoryMessage',

  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss">
.prompt-history-message {
  display: grid;
  gap: $unnnic-spacing-nano;

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-weight: $unnnic-font-weight-bold;
    font-size: $unnnic-font-size-body-md;
  }
  &__content {
    color: $unnnic-color-neutral-darkest;
    font-size: $unnnic-font-size-body-md;
  }
}
</style>
