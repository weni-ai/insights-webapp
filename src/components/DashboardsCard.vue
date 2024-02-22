<template>
  <article class="dashboards-card">
    <div class="dashboards-card__background"></div>
    <p class="dashboards-card__title">
      <slot name="title"></slot>
    </p>
    <unnnic-button
      text="Ver"
      type="secondary"
      size="large"
      class="dashboards-card__button"
      @click="redirectToPage"
    />
  </article>
</template>

<script>
export default {
  props: {
    route: {
      type: String,
      required: true,
    },
  },
  methods: {
    redirectToPage() {
      this.$router.push(this.route);
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboards-card {
  background-color: $unnnic-color-neutral-white;
  padding: $unnnic-spacing-sm;
  border-radius: $unnnic-spacing-nano;
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-xs;
  justify-content: center;
  cursor: pointer;
  border: 1px solid $unnnic-color-neutral-cleanest;
  border-radius: $unnnic-border-radius-md;
  &__background {
    border-radius: $unnnic-border-radius-sm;
    height: 100px;
    background-color: $unnnic-color-weni-50;
    width: 100%;
  }
  &__title {
    color: $unnnic-color-neutral-dark;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
  }
  &__button {
    width: 100%;
  }
}
</style>
