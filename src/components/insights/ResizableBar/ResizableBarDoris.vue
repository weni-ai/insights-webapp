<template>
  <section class="resizable-bar__content-doris">
    <img
      class="resizable-bar__doris-image"
      src="@/assets/images/doris.png"
      alt="Dóris"
    />
    <h1 class="unnnic-font title-lg resizable-bar__doris-title">
      Como posso te ajudar hoje?
    </h1>
  </section>
</template>

<script>
export default {
  name: 'ResizableBarDoris',
};
</script>

<style lang="scss" scoped>
.resizable-bar {
  &__content-doris {
    margin-bottom: auto;

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__doris-image {
    height: 8rem;
    width: 8rem;
  }

  &__doris-title {
    font-weight: $unnnic-font-weight-bold;
  }
}
</style>
