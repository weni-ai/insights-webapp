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
import { mapActions, mapState } from 'pinia';

import { useDashboards } from '@/store/modules/dashboards';
import { useOnboarding } from '@/store/modules/onboarding';

import InsightsLayoutHeader from '@/components/insights/Layout/Header.vue';

export default {
  name: 'InsightsLayout',

  components: {
    InsightsLayoutHeader,
  },

  computed: {
    ...mapState(useDashboards, ['currentDashboardFilters']),
  },

  mounted() {
    this.setOnboardingRef({
      key: 'insights-layout',
      ref: this.$el,
    });
  },
  methods: {
    ...mapActions(useOnboarding, ['setOnboardingRef']),
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
