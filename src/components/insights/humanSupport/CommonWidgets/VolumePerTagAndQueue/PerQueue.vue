<template>
  <BarList
    :title="$t('human_support_dashboard.volume_per_queue.title')"
    :items="formattedItems.slice(0, 5)"
    :tabs="tabs"
    :currentTab="currentTab"
    :isLoading="isLoadingItems"
    :countText="footerText"
    :showSeeAllButton="itemsCount > 5"
    @tab-change="handleTabChange"
    @see-all="handleSeeAll"
  />
  <SeeAllDrawer
    v-model="openSeeAllDrawer"
    :items="formattedItems"
    :title="seeAllDrawerTitle"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

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

const getItems = async ({
  silent = false,
  concat = false,
  limit = 5,
}: GetItemsOptions) => {
  if (props.showConfig) return;

  try {
    isLoadingItems.value = !silent;

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

onMounted(() => {
  getItems({ silent: false, concat: false });
});

watch(currentTab, () => {
  items.value = [];
  itemsNext.value = null;
  itemsPrevious.value = null;
  itemsCount.value = 0;
  getItems({ silent: false, concat: false });
});
</script>

<style scoped lang="scss"></style>
