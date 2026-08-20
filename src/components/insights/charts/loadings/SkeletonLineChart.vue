<template>
  <section class="skeleton-line-container">
    <section class="skeleton-line-container__line">
      <UnnnicSkeletonLoading
        width="100vw"
        height="100vh"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'SkeletonLineChart' });
</script>
