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
        v-if="['attendant', 'pauses'].includes(activeDetailedTab)"
        class="detailed-monitoring__filters"
      >
        <DetailedFilters />
      </section>
    </Transition>
    <section class="detailed-monitoring__tabs">
      <UnnnicTab
        data-testid="human-support-tab"
        :tabs="tabsKeys"
        :activeTab="activeDetailedTab"
        @change="changeActiveTabName"
      >
        <template
          v-for="[key, tab] in Object.entries(tabs)"
          #[`tab-head-${key}`]
          :key="`tab-head-${key}`"
        >
          {{
            $t(`human_support_dashboard.detailed_monitoring.tabs.${tab.name}`)
          }}
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
  </section>
</template>

<script setup lang="ts">
import { UnnnicTab } from '@weni/unnnic-system';
import InAwaiting from './Tables/InAwaiting.vue';
import InProgress from './Tables/InProgress.vue';
import Attendant from './Tables/Attendant.vue';
import Pauses from './Tables/Pauses.vue';
import { storeToRefs } from 'pinia';
import DetailedFilters from './Filters/DetailedFilters.vue';
import {
  ActiveDetailedTab,
  useHumanSupportMonitoring,
} from '@/store/modules/humanSupport/monitoring';
import { Component } from 'vue';

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
    flex: 0 0 calc(100% / 4);
    max-width: calc(100% / 4);
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
