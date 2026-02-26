<template>
  <section
    id="detailed-monitoring"
    class="detailed-monitoring"
  >
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
        <DetailedFilters :type="filterType" />
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
import { computed, Component } from 'vue';
import { storeToRefs } from 'pinia';

import InAwaiting from './Tables/InAwaiting.vue';
import InProgress from './Tables/InProgress.vue';
import Attendant from './Tables/Attendant.vue';
import Pauses from '../Common/Tables/Pauses.vue';
import AgentsCount from './AgentsCount.vue';

import DetailedFilters from '../Common/Filters/DetailedFilters.vue';
import {
  ActiveDetailedTab,
  useHumanSupportMonitoring,
} from '@/store/modules/humanSupport/monitoring';

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
