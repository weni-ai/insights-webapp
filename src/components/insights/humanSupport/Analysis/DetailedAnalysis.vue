<template>
  <section
    id="detailed-analysis"
    ref="detailedAnalysis"
    class="detailed-monitoring"
    data-testid="detailed-analysis"
  >
    <BlurSetupWidget
      v-if="showSetup"
      v-bind="widgetSetupProps"
    />
    <p
      class="detailed-monitoring__title"
      data-testid="detailed-analysis-title"
    >
      {{ $t('human_support_dashboard.analyze.detailed_analysis.title') }}
    </p>
    <Transition name="filters-fade">
      <section
        v-if="['attendant', 'pauses', 'finished'].includes(activeDetailedTab)"
        class="detailed-monitoring__filters"
        data-testid="detailed-analysis-filters"
      >
        <DetailedFilters
          :type="filterType"
          mode="analysis"
        />
      </section>
    </Transition>
    <section
      class="detailed-monitoring__tabs"
      data-testid="detailed-analysis-tabs"
    >
      <UnnnicTabs
        data-testid="human-support-tab"
        :modelValue="activeDetailedTab"
        @update:model-value="changeActiveTabName"
      >
        <UnnnicTabsList>
          <UnnnicTabsTrigger
            v-for="[key, tab] in Object.entries(tabs)"
            :key="key"
            :value="key"
          >
            {{
              $t(
                `human_support_dashboard.analyze.detailed_analysis.tabs.${tab.name}`,
              )
            }}
          </UnnnicTabsTrigger>
        </UnnnicTabsList>
        <UnnnicTabsContent
          v-for="key in tabsKeys"
          :key="key"
          :value="key"
        >
          <section class="detailed-monitoring__tabs-content">
            <component
              :is="tabs[key].component"
              :data-testid="`tab-panel-${key}`"
            />
          </section>
        </UnnnicTabsContent>
      </UnnnicTabs>
    </section>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, useTemplateRef } from 'vue';
import DetailedFilters from '../Common/Filters/DetailedFilters.vue';
import {
  ActiveDetailedTab,
  useHumanSupportAnalysis,
} from '@/store/modules/humanSupport/analysis';
import { Component } from 'vue';
import Finished from './Tables/Finished.vue';
import Attendant from './Tables/Attendant.vue';
import Pauses from '../Common/Tables/Pauses.vue';
import BlurSetupWidget from '@/components/insights/Layout/BlurSetupWidget.vue';
import { useProject } from '@/store/modules/project';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useMouseInElement } from '@vueuse/core';

const projectStore = useProject();
const { hasSectorsConfigured } = storeToRefs(projectStore);
const humanSupport = useHumanSupport();
const { widgetSetupProps } = storeToRefs(humanSupport);

const detailedAnalysisRef = useTemplateRef<HTMLDivElement>('detailedAnalysis');
const { isOutside } = useMouseInElement(detailedAnalysisRef);

const showSetup = computed(() => {
  return !hasSectorsConfigured.value && !isOutside.value;
});

const tabs: Record<
  ActiveDetailedTab,
  { name: ActiveDetailedTab; component: Component }
> = {
  finished: {
    name: 'finished',
    component: Finished,
  },
  attendant: {
    name: 'attendant',
    component: Attendant,
  },
  pauses: {
    name: 'pauses',
    component: Pauses,
  },
};

const tabsKeys = Object.keys(tabs);

const humanSupportAnalysis = useHumanSupportAnalysis();
const { activeDetailedTab } = storeToRefs(humanSupportAnalysis);
const { setActiveDetailedTab } = humanSupportAnalysis;

const changeActiveTabName = (tab: ActiveDetailedTab) => {
  setActiveDetailedTab(tab);
};

const filterType = computed(() => {
  return activeDetailedTab.value as 'attendant' | 'pauses' | 'finished';
});
</script>

<style scoped lang="scss">
.detailed-monitoring {
  position: relative;
  display: flex;
  padding: $unnnic-space-6;
  flex-direction: column;
  gap: $unnnic-space-4;

  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-gray-2;
  background: $unnnic-color-gray-0;

  &__title {
    font: $unnnic-font-display-2;
  }

  &__filters {
    display: flex;
    flex-direction: column;
  }

  &__tabs-content {
    margin-top: $unnnic-space-2;
  }
}

.filters-fade-enter-active,
.filters-fade-leave-active {
  transition: all 0.3s ease;
}

.filters-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.filters-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
