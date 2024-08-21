<template>
  <section class="insights-layout">
    <InsightsLayoutHeader />
    <section
      v-if="currentDashboardFilters.length"
      ref="insightsContent"
      class="insights-layout__insights"
    >
      <main
        class="insights__main"
        :style="{
          height: '100%' || `${mainHeight}vh`,
        }"
      >
        <slot />
      </main>
    </section>
    <!-- <ResizableBar /> -->
  </section>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

// import { pxToVh } from '@/utils/css';

// import ResizableBar from '@/components/insights/ResizableBar/index.vue';

import InsightsLayoutHeader from '@/components/insights/Layout/Header.vue';

export default {
  name: 'InsightsLayout',

  components: {
    InsightsLayoutHeader,
    // ResizableBar,
  },

  computed: {
    ...mapState({
      contentHeight: (state) => state.resizableBar.contentHeight,
      barHandlerHeight: (state) => state.resizableBar.barHandlerHeight,
      currentDashboardFilters: (state) =>
        state.dashboards.currentDashboardFilters,
    }),

    mainHeight() {
      // 81 is the default value when the resizable bar is minimized.
      return 81;
      // return (
      //   pxToVh(this.$refs.insightsContent?.clientHeight) -
      //     this.contentHeight -
      //     pxToVh(this.barHandlerHeight) || 0
      // );
    },
  },

  mounted() {
    this.setOnboardingRef({
      key: 'insights-layout',
      ref: this.$el,
    });
  },
  methods: {
    ...mapMutations({ setOnboardingRef: 'onboarding/SET_ONBOARDING_REF' }),
  },
};
</script>

<style lang="scss" scoped>
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

  &__insights {
    overflow: hidden;

    height: 100%;

    position: relative;

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
