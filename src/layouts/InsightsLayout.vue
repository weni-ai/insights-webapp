<template>
  <section class="insights-layout">
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
</template>

<script>
import { mapState } from 'vuex';

import { pxToVh } from '@/utils/css';

import ResizableBar from '@/components/insights/ResizableBar/index.vue';

import InsightsLayoutHeader from '@/components/insights/Layout/Header.vue';

export default {
  name: 'InsightsLayout',

  components: {
    InsightsLayoutHeader,
    ResizableBar,
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
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  width: 100vw;
  max-width: 100vw;

  overflow: hidden;

  padding: $unnnic-spacing-sm;

  gap: $unnnic-spacing-sm;
  position: relative;

  &__sidebar {
    grid-area: sidebar;
  }

  &__topbar {
    grid-area: topbar;
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
