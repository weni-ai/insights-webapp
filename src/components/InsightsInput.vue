<template>
  <section class="insights-input">
    <input
      class="insights-input__input"
      type="text"
      placeholder="Peça insights ao InsightsGPT..."
    />
    <unnnic-button
      type="secondary"
      size="large"
      iconCenter="send"
      iconFilled
    />
  </section>
</template>

<script>
export default {
  name: 'InsightsInput',
};
</script>

<style lang="scss" scoped>
.insights-input {
  width: 100%;

  margin-top: auto;

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

    color: $unnnic-color-neutral-cloudy;
  }
}
</style>