<template>
  <BarList
    :title="$t(titleKey)"
    :items="formattedItems.slice(0, 5)"
    :tabs="tabsList"
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

import type {
  VolumeBarListFetchMethod,
  VolumeBarListMockConfig,
  VolumeBarListTabItem,
  WidgetContext,
} from './types';
import i18n from '@/utils/plugins/i18n';

const { t } = i18n.global;

defineOptions({
  name: 'VolumeBarListWidget',
});

interface VolumeBarListWidgetProps {
  titleKey: string;
  tabs: (_context: WidgetContext) => VolumeBarListTabItem[];
  defaultTab: string;
  mock: VolumeBarListMockConfig;
  itemKey: 'queues' | 'tags';
  itemLabelKey: 'queue_name' | 'tag_name';
  formatFooterText: (
    _context: WidgetContext,
    _currentTab: string,
    _count: number,
    _statusLabel?: string,
  ) => string;
  seeAllTitleKey: string;
  fetchMethod: (_context: WidgetContext) => VolumeBarListFetchMethod;
  context: WidgetContext;
  showConfig?: boolean;
}

const humanSupportStore = useHumanSupport();
const humanSupportMonitoringStore = useHumanSupportMonitoring();

const { appliedFilters } = storeToRefs(humanSupportStore);
const { refreshDataMonitoring, autoRefresh } = storeToRefs(
  humanSupportMonitoringStore,
);

const props = withDefaults(defineProps<VolumeBarListWidgetProps>(), {
  showConfig: false,
});

const itemsMock = computed<ProgressTableRowItem[]>(() =>
  Array.from({ length: 5 }, (_, index) => ({
    label: `${props.mock.labelPrefix} ${index + 1}`,
    subtitle: props.mock.subtitle,
    value: (index + 1) * 10,
    description: `${(index + 1) * 10}`,
    color: props.mock.color,
    backgroundColor: props.mock.backgroundColor,
  })).reverse(),
);

const tabsList = computed(() => props.tabs(props.context));

const currentTab = ref<string>(props.defaultTab);

const handleTabChange = (tab: string) => {
  currentTab.value = tab;
};

interface Item {
  sector_name: string;
  queues?: { queue_name: string; value: number }[];
  tags?: { tag_name: string; value: number }[];
}

const itemsNext = ref<string | null>(null);
const itemsPrevious = ref<string | null>(null);
const itemsCount = ref(0);
const items = ref<Item[]>([]);
const isLoadingItems = ref(false);
const showVisualLoading = ref(true);

const formattedItems = computed(() => {
  if (props.showConfig) return itemsMock.value;
  const { itemKey, itemLabelKey, mock } = props;
  return items.value.flatMap((item) => {
    const subitems = item[itemKey] ?? [];
    return subitems.map(
      (subitem: { queue_name?: string; tag_name?: string; value: number }) => ({
        label: subitem[itemLabelKey] ?? '',
        subtitle: item.sector_name,
        value: subitem.value,
        description: `${subitem.value}`,
        color: mock.color,
        backgroundColor: mock.backgroundColor,
      }),
    );
  });
});

const footerText = computed(() => {
  const statusLabel = tabsList.value.find(
    (tab) => tab.key === currentTab.value,
  )?.name;
  const count = props.showConfig
    ? formattedItems.value.length
    : itemsCount.value;
  return props.formatFooterText(
    props.context,
    currentTab.value,
    count,
    statusLabel,
  );
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

    const fetchMethod = props.fetchMethod(props.context);
    const { results, next, count } = await fetchMethod({
      cursor: itemsNext.value,
      limit,
      chip_name: currentTab.value,
    });

    items.value = concat
      ? items.value.concat(results as typeof items.value)
      : (results as typeof items.value);
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
  const statusLabel = tabsList.value.find(
    (tab) => tab.key === currentTab.value,
  )?.name;
  return `${t(props.seeAllTitleKey)} - ${statusLabel}`;
});

onMounted(async () => {
  await getItems({ silent: false, concat: false });
});

watch(
  () => props.defaultTab,
  (newDefaultTab) => {
    currentTab.value = newDefaultTab;
  },
);

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
