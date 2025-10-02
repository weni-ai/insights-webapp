<template>
  <section
    class="short-tab"
    data-testid="short-tab"
  >
    <section
      class="short-tab__tabs"
      data-testid="short-tab-container"
    >
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="[
          'short-tab__tab',
          { 'short-tab__tab--active': activeTab === tab.key },
        ]"
        :data-testid="`short-tab-button-${index}`"
        @click="switchTab(tab.key)"
      >
        {{ tab.name }}
      </button>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref, defineEmits, watch } from 'vue';
interface Tab {
  name: string;
  key: string;
}
interface Props {
  tabs: Tab[];
  currentTab?: string;
}
const props = withDefaults(defineProps<Props>(), {
  currentTab: '',
});
const emit = defineEmits<{
  (_e: 'tab-change', tab: string): void;
}>();
const activeTab = ref(props.currentTab || props.tabs[0].key);

watch(
  () => props.currentTab,
  (newCurrentTab) => {
    if (newCurrentTab && newCurrentTab !== activeTab.value) {
      activeTab.value = newCurrentTab;
    }
  },
);

const switchTab = (key: string) => {
  if (key !== activeTab.value) {
    activeTab.value = key;
    emit('tab-change', key);
  }
};
</script>

<style lang="scss" scoped>
.short-tab {
  &__tabs {
    display: flex;
    gap: $unnnic-spacing-nano;
    background-color: $unnnic-color-background-grass;
    border-radius: $unnnic-border-radius-pill;
    padding: $unnnic-spacing-nano;
    align-items: center;
  }

  &__tab {
    border: none;
    border-radius: $unnnic-border-radius-pill;

    padding: $unnnic-spacing-nano $unnnic-spacing-ant;

    flex: 1;
    gap: $unnnic-spacing-nano;
    justify-content: center;
    white-space: nowrap;
    align-items: center;

    background-color: $unnnic-color-background-grass;
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;

    cursor: pointer;

    transition: all 0.3s ease;

    &:hover {
      background-color: $unnnic-color-neutral-light;
      color: $unnnic-color-neutral-dark;
    }

    &--active {
      background-color: $unnnic-color-neutral-white;
      color: $unnnic-color-neutral-dark;

      &:hover {
        background-color: $unnnic-color-neutral-white;
        color: $unnnic-color-neutral-dark;
      }
    }
  }
}
</style>
