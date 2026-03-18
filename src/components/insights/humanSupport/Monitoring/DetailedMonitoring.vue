<template>
  <section
    id="detailed-monitoring"
    ref="detailedMonitoring"
    class="detailed-monitoring"
  >
    <BlurSetupWidget
      v-if="showSetup"
      v-bind="widgetSetupProps"
    />
    <p class="detailed-monitoring__title">
      {{ $t('human_support_dashboard.detailed_monitoring.title') }}
    </p>
    <Transition name="filters-fade">
      <section
        v-if="
          ['attendant', 'pauses', 'in_awaiting', 'in_progress'].includes(
            activeDetailedTab,
          )
        "
        class="detailed-monitoring__filters"
      >
        <DetailedFilters
          :type="filterType"
          mode="monitoring"
        />
      </section>
    </Transition>
    <section class="detailed-monitoring__tabs">
      <UnnnicTabs
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
              $t(`human_support_dashboard.detailed_monitoring.tabs.${tab.name}`)
            }}
          </UnnnicTabsTrigger>
          <template #right>
            <AgentsCount v-if="showAgentsCount" />
          </template>
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
import { computed, Component, useTemplateRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useMouseInElement } from '@vueuse/core';

import InAwaiting from './Tables/InAwaiting.vue';
import InProgress from './Tables/InProgress.vue';
import Attendant from './Tables/Attendant.vue';
import Pauses from '../Common/Tables/Pauses.vue';
import AgentsCount from './AgentsCount.vue';
import DetailedFilters from '../Common/Filters/DetailedFilters.vue';
import BlurSetupWidget from '@/components/insights/Layout/BlurSetupWidget.vue';

import {
  ActiveDetailedTab,
  useHumanSupportMonitoring,
} from '@/store/modules/humanSupport/monitoring';
import { useProject } from '@/store/modules/project';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

const project = useProject();
const { hasSectorsConfigured } = storeToRefs(project);

const humanSupport = useHumanSupport();
const { widgetSetupProps } = storeToRefs(humanSupport);

const detailedMonitoringRef =
  useTemplateRef<HTMLDivElement>('detailedMonitoring');
const { isOutside } = useMouseInElement(detailedMonitoringRef);

const showSetup = computed(() => {
  return !hasSectorsConfigured.value && !isOutside.value;
});

const tabs: Record<
  ActiveDetailedTab,
  { name: ActiveDetailedTab; component: Component }
> = {
  in_awaiting: {
    name: 'in_awaiting',
    component: InAwaiting,
  },
  in_progress: {
    name: 'in_progress',
    component: InProgress,
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

const humanSupportMonitoring = useHumanSupportMonitoring();
const { activeDetailedTab } = storeToRefs(humanSupportMonitoring);
const { setActiveDetailedTab } = humanSupportMonitoring;

const changeActiveTabName = (tab: ActiveDetailedTab) => {
  setActiveDetailedTab(tab);
};

const showAgentsCount = computed(() => {
  return activeDetailedTab.value === 'attendant';
});

const filterType = computed(() => {
  return activeDetailedTab.value as
    | 'attendant'
    | 'pauses'
    | 'in_awaiting'
    | 'in_progress';
});
</script>

<style scoped lang="scss">
.detailed-monitoring {
  position: relative;
  display: flex;
  padding: $unnnic-space-6;
  flex-direction: column;
  gap: $unnnic-space-6;

  border-radius: $unnnic-radius-2;
  border: 1px solid $unnnic-color-neutral-soft;
  background: $unnnic-color-background-white;

  &__title {
    font: $unnnic-font-display-2;
  }

  &__filters {
    display: flex;
    flex-direction: column;
  }
  &__tabs-content {
    margin-top: $unnnic-space-8;
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
