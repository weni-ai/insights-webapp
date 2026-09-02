<template>
  <section
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
        <section class="tab-head-content">
          {{ $t(`human_support_dashboard.${tab.name}`) }}
        </section>
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
import Analysis from '../humanSupport/Analysis/Analysis.vue';
import Monitoring from '../humanSupport/Monitoring/Monitoring.vue';
import {
  useHumanSupport,
  type ActiveTab,
} from '@/store/modules/humanSupport/humanSupport';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

const humanSupportStore = useHumanSupport();
const humanSupportMonitoringStore = useHumanSupportMonitoring();

const { activeTab } = storeToRefs(humanSupportStore);
const { autoRefresh } = storeToRefs(humanSupportMonitoringStore);
const { setActiveTab } = humanSupportStore;

const tabs = {
  monitoring: {
    name: 'live',
    component: Monitoring,
  },
  analysis: {
    name: 'historical_data',
    component: Analysis,
  },
};

const tabsKeys = Object.keys(tabs);

const handleChangeTab = (tab: ActiveTab) => {
  setActiveTab(tab);
  if (tab === 'monitoring') {
    autoRefresh.value = true;
  }
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

  .tab-head-content {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
  }

  .tab-head-content-icon {
    display: flex;
    width: $unnnic-icon-size-4;
    height: $unnnic-icon-size-4;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1/1;
    border-radius: $unnnic-radius-full;
    border: 1px solid $unnnic-color-gray-7;
  }
}
</style>
