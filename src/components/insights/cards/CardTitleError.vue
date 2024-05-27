<template>
  <section class="card-title-error">
    <UnnnicIcon
      icon="error"
      scheme="aux-orange-500"
      size="avatar-nano"
      filled
    />
    <strong class="card-title-error__title">Erro ao buscar métrica</strong>
  </section>
</template>

<script>
export default {
  name: 'CardTitleError',
};
</script>

<style lang="scss" scoped>
.card-title-error {
  display: flex;
  gap: $unnnic-spacing-xs;
  align-items: center;

  &__title {
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-line-height-small * 6;
  }
}
</style>
