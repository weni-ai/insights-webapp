<template>
  <section class="insights-layout">
    <main>
      <slot />
    </main>
    <ResizableBar />
  </section>
</template>

<script>
import ResizableBar from '@/components/ResizableBar.vue';

export default {
  name: 'InsightsLayout',
  components: { ResizableBar },
};
</script>

<style lang="scss" scoped>
.insights-layout {
  padding: 0;

  height: 100vh;
  max-height: 100vh;
  width: 100vw;
  max-width: 100vw;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  & > * {
    padding: 0 $unnnic-spacing-sm;
  }
}

main {
  grid-column: 2;

  height: 100%;

  background-color: $unnnic-color-neutral-white;
}
</style>
