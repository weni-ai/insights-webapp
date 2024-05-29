<template>
  <section class="insights-layout">
    <ConnectSidebar class="insights-layout__sidebar" />
    <ConnectTopbar class="insights-layout__topbar" />

    <section class="insights-layout__container">
      <InsightsLayoutHeader />
      <section
        class="insights-layout__insights"
        ref="insightsContent"
      >
        <main
          class="insights__main"
          :style="{
            height: `${mainHeight}vh`,
          }"
        >
          <slot />
        </main>
      </section>
      <ResizableBar />
    </section>
  </section>
</template>

<script>
import { mapState } from 'vuex';

import { pxToVh } from '@/utils/css';

import ResizableBar from '@/components/insights/ResizableBar/index.vue';
import ConnectSidebar from '@/components/connect/ConnectSidebar.vue';
import ConnectTopbar from '@/components/connect/ConnectTopbar.vue';

import InsightsLayoutHeader from '@/components/insights/Layout/Header.vue';

export default {
  name: 'InsightsLayout',

  components: {
    InsightsLayoutHeader,
    ResizableBar,
    ConnectSidebar,
    ConnectTopbar,
  },

  computed: {
    ...mapState({
      contentHeight: (state) => state.resizableBar.contentHeight,
      barHandlerHeight: (state) => state.resizableBar.barHandlerHeight,
    }),

    mainHeight() {
      return (
        pxToVh(this.$refs.insightsContent?.clientHeight) -
          this.contentHeight -
          pxToVh(this.barHandlerHeight) || 0
      );
    },
  },
};
</script>

<style lang="scss" scoped>
$topbarHeight: 88px;

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

  &__container {
    position: relative;

    overflow: hidden;

    padding: $unnnic-spacing-sm;

    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;
  }

  &__insights {
    height: calc(100vh - $topbarHeight);

    position: relative;

    grid-area: insights;
    display: grid;
    grid-template-rows: minmax(4fr, 6fr) auto;
    grid-template-columns: auto;

    .insights__main {
      display: flex;
      flex-direction: column;

      background-color: $unnnic-color-neutral-white;

      overflow-y: auto;
      overflow-x: hidden;

      transition: height ease-in-out 0.3s;
    }
  }
}
</style>
