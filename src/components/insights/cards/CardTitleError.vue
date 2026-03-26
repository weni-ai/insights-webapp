<template>
  <section class="card-title-error">
    <UnnnicIcon
      icon="error"
      scheme="aux-orange-500"
      size="avatar-nano"
      filled
    />
    <strong class="card-title-error__title">
      {{ $t('widgets.metric_error') }}
    </strong>
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
  gap: $unnnic-space-2;
  align-items: center;

  &__title {
    color: $unnnic-color-gray-12;
    font-family: $unnnic-font-family;
    font-weight: $unnnic-font-weight-bold;
    line-height: 4px * 6;
  }
}
</style>
