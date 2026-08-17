<template>
  <section
    class="beta_text_container"
    data-testid="beta-container"
  >
    <p
      class="beta_text"
      data-testid="beta-text"
    >
      BETA
    </p>
  </section>
</template>

<style lang="scss" scoped>
.beta_text_container {
  display: flex;
  height: 30px;
  padding: 0 $unnnic-space-3;
  justify-content: center;
  align-items: center;
  gap: $unnnic-space-1;
  flex-shrink: 0;

  border-radius: $unnnic-radius-full;
  background: $unnnic-color-bg-accent-plain;
}

.beta_text {
  color: $unnnic-color-fg-emphasized;
  font: $unnnic-font-caption-1;
  white-space: nowrap;
}
</style>
