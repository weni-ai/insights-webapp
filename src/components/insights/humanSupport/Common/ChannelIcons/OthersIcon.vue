<template>
  <p class="others-icon">{{ $t('human_support_dashboard.channels.others') }}</p>
</template>

<script setup lang="ts">
defineOptions({
  name: 'OthersIcon',
});
</script>

<style scoped lang="scss">
.others-icon {
  color: $unnnic-color-fg-emphasized;
  font: $unnnic-font-emphasis;
}
</style>
