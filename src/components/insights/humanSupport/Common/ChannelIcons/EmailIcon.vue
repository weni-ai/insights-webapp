<template>
  <UnnnicToolTip
    enabled
    text="Email"
    side="right"
  >
    <section class="email-icon">
      <UnnnicIcon
        icon="mail"
        scheme="fg-accent"
        size="avatar-nano"
      />
    </section>
  </UnnnicToolTip>
</template>

<script setup lang="ts">
defineOptions({
  name: 'EmailIcon',
});
</script>

<style scoped lang="scss">
.email-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: $unnnic-color-bg-accent-plain;
  border-radius: $unnnic-radius-1;
}
</style>
