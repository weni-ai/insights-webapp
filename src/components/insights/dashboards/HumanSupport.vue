<template>
  <section
    v-if="isEnabled"
    class="dashboard-human-support"
    data-testid="dashboard-human-support"
  >
    <UnnnicTab
      data-testid="human-support-tab"
      :tabs="tabsKeys"
      :activeTab="activeTab"
      @change="handleChangeTab"
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
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import Analysis from '../humanSupport/Analysis/Analysis.vue';
import Monitoring from '../humanSupport/Monitoring/Monitoring.vue';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import {
  useHumanSupport,
  type ActiveTab,
} from '@/store/modules/humanSupport/humanSupport';

const { isFeatureFlagEnabled } = useFeatureFlag();

const isEnabled = computed(() => {
  return isFeatureFlagEnabled('insights-new-human-dashboard');
});

const humanSupportStore = useHumanSupport();
const { activeTab } = storeToRefs(humanSupportStore);
const { setActiveTab } = humanSupportStore;

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

const handleChangeTab = (tab: string) => {
  setActiveTab(tab as ActiveTab);
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
