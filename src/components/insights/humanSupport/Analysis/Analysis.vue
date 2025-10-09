<template>
  <section class="analysis">
    <img
      :src="hourglass"
      width="60px"
      height="60px"
    />
    <p class="analysis__title">
      {{ $t('human_support_dashboard.analyze.title') }}
    </p>
    <p class="analysis__description">
      {{ $t('human_support_dashboard.analyze.description') }}
    </p>
  </section>
</template>

<script setup lang="ts">
const hourglass = new URL(
  '@/assets/images/icons/hourglass.svg',
  import.meta.url,
).href;
</script>

<style scoped lang="scss">
.analysis {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: $unnnic-space-6;
  height: 484px;

  &__title {
    font: $unnnic-font-display-2;
  }

  &__description {
    font: $unnnic-font-body;
  }
}
</style>
