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
import { ref, watch } from 'vue';
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
  'tab-change': [tab: string];
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
    gap: $unnnic-space-1;
    background-color: $unnnic-color-bg-soft;
    border-radius: $unnnic-radius-2;
    padding: $unnnic-space-1;
    align-items: center;
  }

  &__tab {
    border: none;
    border-radius: $unnnic-radius-1;

    padding: $unnnic-space-2 $unnnic-space-4;

    flex: 1;
    gap: $unnnic-space-1;
    justify-content: center;
    white-space: nowrap;
    align-items: center;

    background-color: $unnnic-color-bg-soft;
    color: $unnnic-color-gray-500;
    font: $unnnic-font-caption-1;

    cursor: pointer;

    transition: all 0.3s ease;

    &:hover {
      background-color: $unnnic-color-bg-soft;
      color: $unnnic-color-fg-emphasized;
    }

    &--active {
      background-color: $unnnic-color-bg-base;
      border: 1px solid $unnnic-color-border-soft;
      color: $unnnic-color-fg-emphasized;

      &:hover {
        background-color: $unnnic-color-bg-base;
        color: $unnnic-color-fg-emphasized;
      }
    }
  }
}
</style>
