<template>
  <section class="header-tag-live">
    <UnnnicIcon
      class="header-tag-live__indicator"
      icon="indicator"
      scheme="aux-green-300"
    />
    <p class="header-tag-live__text">Hoje</p>
  </section>
</template>

<script>
export default {
  name: 'HeaderTagLive',
};
</script>

<style lang="scss">
.header-tag-live {
  padding: 0 $unnnic-spacing-xs;

  display: inline-flex;
  align-items: center;

  color: $unnnic-color-neutral-darkest;
  font-family: $unnnic-font-family-secondary;

  &__indicator {
    .primary {
      animation: ease-in-out pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        fill: $unnnic-color-neutral-soft;
      }

      50% {
        fill: $unnnic-color-aux-green-300;
      }

      100% {
        fill: $unnnic-color-neutral-soft;
      }
    }
  }

  &__text {
    margin: 0;

    font-size: $unnnic-font-size-body-gt;
  }
}
</style>
