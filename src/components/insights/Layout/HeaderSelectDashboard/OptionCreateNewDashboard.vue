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
  padding: $unnnic-space-2;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: $unnnic-space-1;

  border-top: 1px solid $unnnic-color-gray-1;

  color: $unnnic-color-gray-12;
  font-family: $unnnic-font-family;
  font-size: 14px;
}
</style>
