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
          { 'short-tab__tab--active': activeTab === index },
        ]"
        :data-testid="`short-tab-button-${index}`"
        @click="switchTab(index)"
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
  defaultTab?: number;
}
const props = withDefaults(defineProps<Props>(), {
  defaultTab: 0,
});
const emit = defineEmits<{
  (_e: 'tab-change', tab: string): void;
}>();
const activeTab = ref(props.defaultTab);

watch(
  () => props.defaultTab,
  (newDefaultTab) => {
    activeTab.value = newDefaultTab;
  },
);

const switchTab = (index: number) => {
  if (index !== activeTab.value) {
    activeTab.value = index;
    emit('tab-change', props.tabs[index].key);
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
