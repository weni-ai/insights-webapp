<template>
  <UnnnicSegmentedControl
    class="short-tab"
    data-testid="short-tab"
    :modelValue="activeTab"
    @update:model-value="switchTab"
  >
    <UnnnicSegmentedControlList
      class="short-tab__tabs"
      data-testid="short-tab-container"
      size="small"
    >
      <UnnnicSegmentedControlTrigger
        v-for="(tab, index) in tabs"
        :key="index"
        :value="tab.key"
        :data-testid="`short-tab-button-${index}`"
        class="short-tab__tab"
      >
        {{ tab.name }}
      </UnnnicSegmentedControlTrigger>
    </UnnnicSegmentedControlList>
  </UnnnicSegmentedControl>
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

defineExpose({ activeTab, switchTab });
</script>

<style lang="scss" scoped>
.short-tab {
  &__tab {
    white-space: nowrap;
  }
}
</style>
