<template>
  <BarList
    :title="$t(titleKey)"
    :items="formattedItems.slice(0, 5)"
    :tabs="tabsList"
    :currentTab="currentTab"
    :isLoading="isLoadingItems && showVisualLoading"
    :countText="footerText"
    :showSeeAllButton="activeItemsCount > 5"
    :showConfig="props.showConfig"
    :emptyDataText="emptyDataText"
    :setupTitle="props.setupTitle"
    :setupDescription="props.setupDescription"
    @tab-change="handleTabChange"
    @see-all="handleSeeAll"
    @click:setup="emit('click:setup')"
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
import { useProject } from '@/store/modules/project';

import BarList from '../BarList/index.vue';
import SeeAllDrawer from './SeeAllDrawer.vue';

import type { ProgressTableRowItem } from '@/components/ProgressTableRowItem.vue';

import type {
  VolumeBarListFetchMethod,
  VolumeBarListTabItem,
  WidgetContext,
} from './types';

import i18n from '@/utils/plugins/i18n';
import { orderBy } from '@/utils/array';
import { formatNumber } from '@/utils/numbers';
import {
  colorBgBluePlain,
  colorBgBlueStrong,
} from '@weni/unnnic-system/tokens/colors';

const { t } = i18n.global;

const projectStore = useProject();
const { hasSectorsConfigured } = storeToRefs(projectStore);

defineOptions({
  name: 'VolumeBarListWidget',
});

const emit = defineEmits<{
  'click:setup': [];
}>();

interface VolumeBarListWidgetProps {
  titleKey: string;
  tabs: (_context: WidgetContext) => VolumeBarListTabItem[];
  defaultTab: string;
  mock: Item[];
  mockItemsCount: number;
  barColor?: string;
  barBackgroundColor?: string;
  itemKey: 'queues' | 'tags';
  itemLabelKey: 'queue_name' | 'tag_name';
  formatFooterText: (
    _context: WidgetContext,
    _currentTab: string,
    _count: number,
    _statusLabel?: string,
  ) => string;
  formatEmptyDataText: (
    _context: WidgetContext,
    _currentTab?: string,
  ) => string;
  seeAllTitleKey: string;
  fetchMethod: (_context: WidgetContext) => VolumeBarListFetchMethod;
  context: WidgetContext;
  showConfig?: boolean;
  setupTitle?: string;
  setupDescription?: string;
}

const humanSupportStore = useHumanSupport();
const humanSupportMonitoringStore = useHumanSupportMonitoring();

const { appliedFilters, appliedDateRange } = storeToRefs(humanSupportStore);
const { refreshDataMonitoring, autoRefresh } = storeToRefs(
  humanSupportMonitoringStore,
);

const props = withDefaults(defineProps<VolumeBarListWidgetProps>(), {
  showConfig: false,
  setupTitle: '',
  setupDescription: '',
  barColor: colorBgBlueStrong,
  barBackgroundColor: colorBgBluePlain,
});

const tabsList = computed(() => props.tabs(props.context));

const currentTab = ref<string>(props.defaultTab);

const handleTabChange = (tab: string) => {
  currentTab.value = tab;
};

interface Item {
  sector_name: string;
  is_deleted?: boolean;
  queues?: { queue_name: string; value: number; is_deleted?: boolean }[];
  tags?: { tag_name: string; value: number; is_deleted?: boolean }[];
}

const itemsNext = ref<string | null>(null);
const itemsPrevious = ref<string | null>(null);
const itemsCount = ref(0);
const activeItemsCount = computed(() => {
  if (!hasSectorsConfigured.value) return props.mockItemsCount;
  return itemsCount.value;
});
const items = ref<Item[]>([]);
const isLoadingItems = ref(false);
const showVisualLoading = ref(true);

const getDeletedTooltip = (
  subitemDeleted: boolean,
  sectorDeleted: boolean,
): string | undefined => {
  const isQueue = props.itemKey === 'queues';

  if (subitemDeleted && sectorDeleted) {
    return isQueue
      ? t('human_support_dashboard.deleted_tooltips.queue_and_sector')
      : t('human_support_dashboard.deleted_tooltips.tag_and_sector');
  }
  if (subitemDeleted) {
    return isQueue
      ? t('human_support_dashboard.deleted_tooltips.queue')
      : t('human_support_dashboard.deleted_tooltips.tag');
  }
  if (sectorDeleted) {
    return t('human_support_dashboard.deleted_tooltips.sector');
  }
  return undefined;
};

const formattedItems = computed(() => {
  const { itemKey, itemLabelKey } = props;

  const toFormatItems = hasSectorsConfigured.value ? items.value : props.mock;

  const toOrderItems: ProgressTableRowItem[] = toFormatItems.flatMap((item) => {
    const subitems = item[itemKey] ?? [];
    const sectorDeleted = item.is_deleted === true;
    return subitems.map(
      (subitem: {
        queue_name?: string;
        tag_name?: string;
        value: number;
        is_deleted?: boolean;
      }) => {
        const subitemDeleted = subitem.is_deleted === true;

        return {
          label: subitem[itemLabelKey] ?? '',
          subtitle: item.sector_name,
          value: subitem.value,
          description: `${formatNumber(subitem.value)}`,
          color: props.barColor,
          backgroundColor: props.barBackgroundColor,
          labelMuted: subitemDeleted,
          subtitleMuted: sectorDeleted,
          deletedTooltip: getDeletedTooltip(subitemDeleted, sectorDeleted),
        };
      },
    );
  });

  return orderBy(
    toOrderItems,
    ['value', 'label'],
    ['desc', 'asc'],
  ) as ProgressTableRowItem[];
});

const footerText = computed(() => {
  const statusLabel = tabsList.value.find(
    (tab) => tab.key === currentTab.value,
  )?.name;
  const count = props.showConfig
    ? formattedItems.value.length
    : activeItemsCount.value;
  return props.formatFooterText(
    props.context,
    currentTab.value,
    count,
    statusLabel,
  );
});

const emptyDataText = computed(() => {
  if (props.showConfig) return '';

  return props.formatEmptyDataText(props.context, currentTab.value);
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
  if (props.showConfig || !hasSectorsConfigured.value) return;

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

watch([currentTab, appliedFilters, appliedDateRange], async () => {
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
