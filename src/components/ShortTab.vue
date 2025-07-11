<template>
  <section class="short-tab">
    <div class="short-tab__tabs">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="[
          'short-tab__tab',
          { 'short-tab__tab--active': activeTab === index },
        ]"
        @click="switchTab(index)"
      >
        {{ tab.name }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';
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
  (_e: 'tabChange', tab: string): void;
}>();
const activeTab = ref(props.defaultTab);
const switchTab = (index: number) => {
  if (index !== activeTab.value) {
    activeTab.value = index;
    emit('tabChange', props.tabs[index].key);
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
    flex: 1;
    padding: $unnnic-spacing-nano $unnnic-spacing-ant;
    gap: 0.625rem;
    justify-content: center;
    align-items: center;
    border: none;
    border-radius: $unnnic-border-radius-pill;
    background-color: $unnnic-color-background-grass;
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-regular;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    &:hover {
      background-color: $unnnic-color-neutral-light;
      color: $unnnic-color-neutral-dark;
    }
    &--active {
      background-color: $unnnic-color-neutral-white;
      color: $unnnic-color-neutral-dark;
      transform: translateY(-1px);
      &:hover {
        background-color: $unnnic-color-neutral-white;
        color: $unnnic-color-neutral-dark;
      }
    }
  }
}
</style>
