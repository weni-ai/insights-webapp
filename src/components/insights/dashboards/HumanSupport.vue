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
        <section class="tab-head-content">
          {{ $t(`human_support_dashboard.${tab.name}`) }}
          <UnnnicToolTip
            :text="$t(`human_support_dashboard.${tab.name}_tooltip`)"
            side="right"
            class="tab-head-content-tooltip"
            data-test-id="tab-head-content-tooltip"
            enabled
          >
            <section class="tab-head-content-icon">
              <UnnnicIcon
                data-test-id="question_mark"
                icon="question_mark"
                size="xs"
              />
            </section>
          </UnnnicToolTip>
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
import { UnnnicTab, UnnnicIcon, UnnnicToolTip } from '@weni/unnnic-system';
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
    tooltip: 'human_support_dashboard.monitoring_tooltip',
    component: Monitoring,
  },
  analysis: {
    name: 'analysis',
    tooltip: 'human_support_dashboard.analysis_tooltip',
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
    border: 1px solid $unnnic-color-neutral-cloudy;
  }
}
</style>
