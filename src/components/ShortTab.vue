<template>
  <UnnnicSegmentedControl
    class="short-tab"
    :modelValue="activeTab"
    @update:model-value="switchTab"
  >
    <UnnnicSegmentedControlList size="small">
      <UnnnicSegmentedControlTrigger
        v-for="(tab, index) in tabs"
        :key="index"
        :value="tab.key"
        class="short-tab__tab-name"
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
</script>

<style lang="scss" scoped>
.short-tab {
  &__tab-name {
    white-space: nowrap;
  }
}
</style>
