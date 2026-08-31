<template>
  <UnnnicToolTip
    enabled
    text="Shopping Assistant"
    side="right"
  >
    <section class="shopping-assistant-icon">
      <UnnnicIcon
        icon="chat_bubble"
        scheme="fg-on-primary"
        size="avatar-nano"
      />
    </section>
  </UnnnicToolTip>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ShoppingAssistantIcon',
});
</script>

<style scoped lang="scss">
.shopping-assistant-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: $unnnic-color-bg-accent-strong;
  border-radius: $unnnic-radius-full;
}
</style>
