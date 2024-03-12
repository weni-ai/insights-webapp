<template>
  <section class="insights-input">
    <input
      class="insights-input__input"
      type="text"
      placeholder="Peça insights ao InsightsGPT..."
    />
    <div class="insights-input__button">
      <unnnic-button
        type="secondary"
        size="large"
        iconCenter="send"
      />
    </div>
  </section>
</template>

<script>
export default {
  name: 'InsightsInput',
};
</script>

<style lang="scss" scoped>
.insights-input {
  margin-top: auto;
  width: 100%;
  padding: 0 8rem 2rem 8rem;
  display: flex;
  flex-direction: row;
  position: relative;

  background-color: $unnnic-color-neutral-white;

  @media screen and (max-width: 900px) {
    padding: unset;
  }

  &__input {
    width: 100%;
    height: 62px;
    padding: $unnnic-spacing-xs;
    border: none;
    border-radius: $unnnic-spacing-nano;
    background-color: $unnnic-color-neutral-lightest;
    color: $unnnic-color-neutral-cloudy;
  }

  &__button {
    position: absolute;
    height: 46px;
    width: 46px;
    border: 1px $unnnic-color-neutral-cleanest solid;
    border-radius: $unnnic-border-radius-sm;
    background-color: $unnnic-color-neutral-white;
    right: 9rem;
    top: 0.6rem;
    cursor: pointer;

    @media screen and (max-width: 900px) {
      right: 0;
    }
  }
}
</style>