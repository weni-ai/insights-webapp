<template>
  <section class="insights-layout">
    <ConnectSidebar class="insights-layout__sidebar" />
    <ConnectTopbar class="insights-layout__topbar" />

    <section class="insights-layout__insights">
      <section class="insights__main">
        <slot />
      </section>
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
    height: calc(100vh - 88px);

    position: relative;

    grid-area: insights;
    display: flex;
    flex-direction: column;

    padding: $unnnic-spacing-sm;

    .insights__main {
      display: flex;
      flex-direction: column;

      height: 100%;

      background-color: $unnnic-color-neutral-white;
    }
  }
}
</style>
