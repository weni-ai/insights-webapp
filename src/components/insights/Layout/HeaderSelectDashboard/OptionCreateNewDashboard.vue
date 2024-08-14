<template>
  <UnnnicDropdownItem
    data-testid="option-new-dashboard"
    class="option-create-new-dashboard"
  >
    <UnnnicIcon
      data-testid="option-new-dashboard-icon"
      icon="add"
    />
    {{ $t('insights_header.add_new_dashboard') }}
  </UnnnicDropdownItem>
</template>

<script>
export default {
  name: 'OptionCreateNewDashboard',
};
</script>

<style lang="scss" scoped>
.option-create-new-dashboard {
  padding: $unnnic-spacing-xs;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: $unnnic-spacing-nano;

  border-top: $unnnic-border-width-thinner solid $unnnic-color-neutral-light;

  color: $unnnic-color-neutral-darkest;
  font-family: $unnnic-font-family-secondary;
  font-size: $unnnic-font-size-body-gt;
}
</style>
