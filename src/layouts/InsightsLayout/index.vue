<template>
  <section class="insights-layout">
    <ConnectSidebar class="insights-layout__sidebar" />
    <ConnectTopbar class="insights-layout__topbar" />

    <section class="insights-layout__insights">
      <main class="insights__main">
        <slot />
      </main>
      <ResizableBar />
    </section>
  </section>
</template>

<script>
import ResizableBar from '@/components/ResizableBar.vue';
import ConnectSidebar from '@/components/connect/ConnectSidebar.vue';
import ConnectTopbar from '@/components/connect/ConnectTopbar.vue';

export default {
  name: 'InsightsLayout',
  components: { ResizableBar, ConnectSidebar, ConnectTopbar },
};
</script>

<style lang="scss" scoped>
.insights-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'sidebar topbar'
    'sidebar insights';

  height: 100vh;
  max-height: 100vh;
  width: 100vw;
  max-width: 100vw;

  overflow: hidden;

  padding: 0;

  &__sidebar {
    grid-area: sidebar;
  }

  &__topbar {
    grid-area: topbar;
  }

  &__insights {
    grid-area: insights;

    padding: $unnnic-spacing-ant;

    .insights__main {
      grid-column: 2;

      height: 100%;

      background-color: $unnnic-color-neutral-white;
    }
  }
}
</style>
