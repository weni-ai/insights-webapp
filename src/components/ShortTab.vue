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
  tabChange: [index: number, tab: Tab];
}>();

const activeTab = ref(props.defaultTab);

const switchTab = (index: number) => {
  if (index !== activeTab.value) {
    activeTab.value = index;
    emit('tabChange', index, props.tabs[index]);
  }
};
</script>

<style lang="scss" scoped>
.short-tab {
  &__tabs {
    display: flex;
    gap: $unnnic-spacing-xs;
    background-color: $unnnic-color-neutral-lightest;
    border-radius: $unnnic-border-radius-pill;
    padding: $unnnic-spacing-xs;
  }

  &__tab {
    flex: 1;
    padding: $unnnic-spacing-sm $unnnic-spacing-md;
    border: none;
    border-radius: $unnnic-border-radius-pill;
    background-color: transparent;
    color: $unnnic-color-neutral-cloudy;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
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
      color: $unnnic-color-neutral-darkest;
      font-weight: $unnnic-font-weight-bold;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);

      &:hover {
        background-color: $unnnic-color-neutral-white;
        color: $unnnic-color-neutral-darkest;
      }
    }
  }
}
</style>
