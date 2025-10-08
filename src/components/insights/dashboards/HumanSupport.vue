<template>
  <section
    class="dashboard-human-support"
    data-testid="dashboard-human-support"
  >
    <UnnnicTab
      data-testid="human-support-tab"
      :tabs="tabsKeys"
      :activeTab="activeTabName"
      @change="changeActiveTabName"
    >
      <template
        v-for="[key, tab] in Object.entries(tabs)"
        #[`tab-head-${key}`]
        :key="`tab-head-${key}`"
      >
        {{ $t(`human_support_dashboard.${tab.name}`) }}
      </template>
      <template
        v-for="key in Object.keys(tabs)"
        #[`tab-panel-${key}`]
        :key="`tab-panel-${key}`"
      >
        <component
          :is="tabs[key].component"
          :data-testid="`tab-panel-${key}`"
        />
      </template>
    </UnnnicTab>
  </section>
</template>

<script setup lang="ts">
import { UnnnicTab } from '@weni/unnnic-system';
import { ref } from 'vue';
import Analysis from '../humanSupport/Analysis/Analysis.vue';
import Monitoring from '../humanSupport/Monitoring/Monitoring.vue';

// TODO: Remove this comment after the feature flag is implemented in STG
/*const { isFeatureFlagEnabled } = useFeatureFlag();

const isEnabled = computed(() => {
  return isFeatureFlagEnabled('insights-new-human-dashboard');
});*/

const tabs = {
  monitoring: {
    name: 'monitoring',
    component: Monitoring,
  },
  analysis: {
    name: 'analysis',
    component: Analysis,
  },
};

const tabsKeys = Object.keys(tabs);

const activeTabName = ref('monitoring');

const changeActiveTabName = (tab: string) => {
  activeTabName.value = tab;
};
</script>

<style lang="scss" scoped>
.dashboard-human-support {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-8;

  :deep(.tab-header) {
    margin-bottom: $unnnic-space-8;
  }
}
</style>
