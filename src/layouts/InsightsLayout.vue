<template>
  <section class="insights-layout">
    <McpDisclaimer
      v-if="showMcpDisclaimer"
      @dismiss="showMcpDisclaimer = false"
    />
    <InsightsLayoutHeader class="insights-layout__header" />
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
import McpDisclaimer from '@/components/McpDisclaimer.vue';
import { moduleStorage } from '@/utils/storage';

export default {
  name: 'InsightsLayout',

  components: {
    InsightsLayoutHeader,
    McpDisclaimer,
  },

  data() {
    return {
      showMcpDisclaimer:
        moduleStorage.getItem('mcp_news_show_disclaimer') === true,
    };
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

  height: 100%;
  max-height: 100vh;
  width: 100%;
  max-width: 100vw;

  overflow: hidden;

  padding: $unnnic-space-4;
  padding-right: 0;

  gap: $unnnic-space-4;
  position: relative;

  &__header {
    margin-right: $unnnic-space-4;
  }

  &__insights {
    overflow: hidden;

    margin-right: $unnnic-space-2;

    height: 100%;

    position: relative;

    .insights__main {
      height: 100%;

      display: flex;
      flex-direction: column;

      padding-right: $unnnic-space-2;

      background-color: $unnnic-color-gray-0;

      overflow-y: auto;
      overflow-x: hidden;

      transition: height ease-in-out 0.3s;
    }
  }
}
</style>
