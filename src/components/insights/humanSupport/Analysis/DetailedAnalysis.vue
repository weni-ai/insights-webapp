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
import { storeToRefs } from 'pinia';
import DetailedFilters from '../Common/Filters/DetailedFilters.vue';
import {
  ActiveDetailedTab,
  useHumanSupportAnalysis,
} from '@/store/modules/humanSupport/analysis';
import { Component } from 'vue';

const tabs: Record<
  ActiveDetailedTab,
  { name: ActiveDetailedTab; component: Component }
> = {
  finished: {
    name: 'finished',
    component: () => {},
  },
  attendant: {
    name: 'attendant',
    component: () => {},
  },
  pauses: {
    name: 'pauses',
    component: () => {},
  },
};

const tabsKeys = Object.keys(tabs);

const humanSupportAnalysis = useHumanSupportAnalysis();
const { activeDetailedTab } = storeToRefs(humanSupportAnalysis);
const { setActiveDetailedTab } = humanSupportAnalysis;

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
