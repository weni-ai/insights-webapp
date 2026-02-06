<template>
  <BarList
    :title="$t('human_support_dashboard.volume_per_queue.title')"
    :items="formattedItems.slice(0, 5)"
    :tabs="tabs"
    :currentTab="currentTab"
    :isLoading="isLoadingItems && showVisualLoading"
    :countText="footerText"
    :showSeeAllButton="itemsCount > 5"
    @tab-change="handleTabChange"
    @see-all="handleSeeAll"
  />
  <SeeAllDrawer
    v-model="openSeeAllDrawer"
    :items="formattedItems"
    :title="seeAllDrawerTitle"
    enableInfiniteScroll
    :infiniteScrollCanLoadMore="!isLoadingItems && itemsNext"
    @scroll-end="handleInfiniteScroll"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';

import BarList from '../BarList/index.vue';
import SeeAllDrawer from './SeeAllDrawer.vue';

import type { ProgressTableRowItem } from '@/components/ProgressTableRowItem.vue';

import i18n from '@/utils/plugins/i18n';

import volumePerQueueService from '@/services/api/resources/humanSupport/volumePerQueue';

const { t } = i18n.global;

defineOptions({
  name: 'PerQueue',
});

interface PerQueueProps {
  context: 'monitoring' | 'analysis';
  showConfig?: boolean;
}

const humanSupportStore = useHumanSupport();
const humanSupportMonitoringStore = useHumanSupportMonitoring();

const { appliedFilters } = storeToRefs(humanSupportStore);
const { refreshDataMonitoring, autoRefresh } = storeToRefs(
  humanSupportMonitoringStore,
);

const props = withDefaults(defineProps<PerQueueProps>(), {
  showConfig: false,
});

const itemsMock: ProgressTableRowItem[] = Array.from(
  { length: 5 },
  (_, index) => ({
    label: `Queue ${index + 1}`,
    subtitle: `Queue sector`,
    value: index + 1 * 10,
    description: `${index + 1 * 10}`,
    color: '#E5812A',
    backgroundColor: '#FBEED9',
  }),
).reverse();

const tabs = computed(() => {
  const tabsByContext = {
    monitoring: [
      { name: t('waiting'), key: 'waiting' },
      { name: t('in_progress'), key: 'ongoing' },
      { name: t('finished'), key: 'closed' },
    ],
    analysis: [{ name: t('finished'), key: 'closed' }],
  };

  return tabsByContext[props.context] || [];
});

const currentTab = ref<string>(
  props.context === 'monitoring' ? 'ongoing' : 'closed',
);

const handleTabChange = (tab: string) => {
  currentTab.value = tab;
};

const itemsNext = ref<string | null>(null);
const itemsPrevious = ref<string | null>(null);
const itemsCount = ref(0);
const items = ref([]);
const isLoadingItems = ref(false);
const showVisualLoading = ref(true);

const formattedItems = computed(() => {
  if (props.showConfig) return itemsMock;
  return items.value.flatMap((item) => {
    const { queues } = item;
    return queues.map((queue) => ({
      label: queue.queue_name,
      subtitle: item.sector_name,
      value: queue.value,
      description: `${queue.value}`,
      color: '#E5812A',
      backgroundColor: '#FBEED9',
    }));
  });
});

const footerText = computed(() => {
  if (props.context === 'monitoring') {
    const statusLabel = tabs.value.find(
      (tab) => tab.key === currentTab.value,
    )?.name;
    return t('human_support_dashboard.volume_per_queue.monitoring_count', {
      count: itemsCount.value,
      status: statusLabel.toLocaleLowerCase(),
    });
  }

  return t('human_support_dashboard.volume_per_queue.analysis_count', {
    count: itemsCount.value,
  });
});

interface GetItemsOptions {
  silent?: boolean;
  concat?: boolean;
  limit?: number;
}

const handleInfiniteScroll = async () => {
  await getItems({ silent: true, concat: true, limit: 20 });
};

const getItems = async ({
  silent = false,
  concat = false,
  limit = 5,
}: GetItemsOptions) => {
  if (props.showConfig) return;

  try {
    isLoadingItems.value = true;
    showVisualLoading.value = !silent;
    const getDataRequest =
      props.context === 'monitoring'
        ? volumePerQueueService.getVolumePerQueueMonitoring
        : volumePerQueueService.getVolumePerQueueAnalysis;

    const { results, next, count } = await getDataRequest({
      cursor: itemsNext.value,
      limit,
      chip_name: currentTab.value,
    });
    items.value = concat ? items.value.concat(results) : results;
    itemsNext.value = next;
    itemsCount.value = count;
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingItems.value = false;
    showVisualLoading.value = true;
  }
};

const openSeeAllDrawer = ref(false);
const handleSeeAll = () => {
  openSeeAllDrawer.value = true;
};
const seeAllDrawerTitle = computed(() => {
  const statusLabel = tabs.value.find(
    (tab) => tab.key === currentTab.value,
  )?.name;
  return `${t('human_support_dashboard.volume_per_queue.title')} - ${statusLabel}`;
});

onMounted(async () => {
  await getItems({ silent: false, concat: false });
});

watch([currentTab, appliedFilters], async () => {
  itemsNext.value = null;
  itemsPrevious.value = null;
  await getItems({ silent: false, concat: false });
});

watch(refreshDataMonitoring, async () => {
  if (refreshDataMonitoring.value && autoRefresh.value) {
    itemsNext.value = null;
    itemsPrevious.value = null;
    await getItems({ silent: true, concat: false });
  }
});
</script>

<style scoped lang="scss"></style>
