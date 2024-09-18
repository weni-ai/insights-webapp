<template>
  <button class="header-generate-insights-button">
    <img src="@/assets/images/shine.svg" />
    {{ $t('insights_header.generate_insight.title') }}
  </button>
</template>

<script>
export default {
  name: 'HeaderGenerateInsightsButton',
};
</script>

<style scoped lang="scss">
.header-generate-insights-button {
  border: none;

  display: flex;
  gap: $unnnic-spacing-nano;
  justify-content: center;
  align-items: center;

  padding: $unnnic-spacing-ant $unnnic-spacing-sm;

  border-radius: $unnnic-border-radius-sm;
  background: $unnnic-color-neutral-darkest;

  color: $unnnic-color-weni-300;

  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;

  cursor: pointer;
}
</style>
