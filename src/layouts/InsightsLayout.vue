<template>
  <section class="insights-layout">
    <InsightsLayoutHeader />
    <section
      v-if="currentDashboardFilters.length"
      ref="insightsContent"
      class="insights-layout__insights"
      data-testid="content-slot"
    >
      <main class="insights__main">
        <slot />
      </main>
    </section>
  </section>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import InsightsLayoutHeader from '@/components/insights/Layout/Header.vue';

export default {
  name: 'InsightsLayout',

  components: {
    InsightsLayoutHeader,
  },

  computed: {
    ...mapState({
      currentDashboardFilters: (state) =>
        state.dashboards.currentDashboardFilters,
    }),
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
      height: 100%;

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
