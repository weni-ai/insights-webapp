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
  padding: 0 $unnnic-space-1;
  justify-content: center;
  align-items: center;
  gap: 10px;

  border-radius: $unnnic-radius-1;
  background: $unnnic-color-teal-1;
}
.beta_text {
  color: $unnnic-color-teal-8;
  font-family: $unnnic-font-family;
  font-size: 12px;
  font-weight: $unnnic-font-weight-bold;
  line-height: 8px + 12px;
}
</style>
