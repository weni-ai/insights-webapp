<template>
  <section class="widget-human-service-agents">
    <header
      v-if="headerTitle"
      class="widget-human-service-agents__header"
    >
      <section v-if="!isExpansive">
        <h1
          class="header__title"
          data-testid="widget-human-service-agent-title"
        >
          {{ t(headerTitle) }}
        </h1>
      </section>
      <section v-if="!isExpansive">
        <UnnnicButton
          size="small"
          iconCenter="expand_content"
          type="secondary"
          data-testid="expand-button"
          @click.prevent.stop="$emit('seeMore')"
        />
      </section>
      <AgentsTableHeader
        v-if="isExpansive"
        data-testid="agents-table-header"
        :headers="headers"
        :isLoading="isLoading"
      />
    </header>
    <UnnnicDataTable
      :locale="locale"
      :isLoading="isLoading"
      clickable
      fixedHeaders
      height="100%"
      :headers="formattedHeaders"
      :items="formattedItems"
      hidePagination
      data-testid="human-service-agents-table"
      @update:sort="sort = $event"
      @item-click="redirectItem($event)"
    >
      <template #body-status="{ item }">
        <AgentStatus
          :status="item.status.status"
          :label="item.status.status"
          :agent="{ name: item.agent, email: item.agent_email }"
          @request-data="$emit('request-data')"
        />
      </template>
    </UnnnicDataTable>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useAgentsColumnsFilter } from '@/store/modules/agentsColumnsFilter';
import { useWidgets } from '@/store/modules/widgets';
import { useDashboards } from '@/store/modules/dashboards';

import AgentStatus from './AgentStatus.vue';
import AgentsTableHeader from './AgentsTableHeader.vue';

defineOptions({ name: 'HumanServiceAgentsTable' });

const props = withDefaults(
  defineProps<{
    headerTitle?: string;
    headers: any[];
    items: any[];
    isExpansive?: boolean;
    isLoading?: boolean;
  }>(),
  {
    headerTitle: '',
    isExpansive: false,
    isLoading: false,
  },
);

defineEmits<{
  (e: 'seeMore'): void;
  (e: 'request-data'): void;
}>();

const { t, locale } = useI18n();

const agentsColumnsFilterStore = useAgentsColumnsFilter();
const widgetsStore = useWidgets();
const dashboardsStore = useDashboards();

const { visibleColumns } = storeToRefs(agentsColumnsFilterStore);
const { currentExpansiveWidgetFilters } = storeToRefs(widgetsStore);
const { appliedFilters } = storeToRefs(dashboardsStore);

const sort = ref<{ header: string; order: string; itemKey: string }>({
  header: '',
  order: '',
  itemKey: '',
});

const hasExpansiveWidgetFilteringDates = computed(() => {
  return !!currentExpansiveWidgetFilters.value.date?.start;
});

const formattedHeaders = computed(() => {
  const shownHeaders = props.headers?.filter(
    (header: any) => header?.display && !header?.hidden_name,
  );

  if (!shownHeaders) return [];

  if (!props.isExpansive) {
    return shownHeaders.map((header: any, index: number) => ({
      title: t(header.name || ''),
      itemKey: header.value,
      isSortable: true,
      size: index === 1 ? 1 : 0.5,
    }));
  }

  const cols = visibleColumns.value || [];

  const staticHeaders = shownHeaders.filter((header: any) =>
    ['status', 'agent'].includes(header.name),
  );

  const dynamicHeaders = shownHeaders.filter(
    (header: any) =>
      cols.includes(header.name) && !['status', 'agent'].includes(header.name),
  );

  const sortedDynamicHeaders = sortHeadersByVisibleColumns(
    dynamicHeaders,
    cols,
  );

  const allHeaders = [...staticHeaders, ...sortedDynamicHeaders];

  return allHeaders.map((header: any, index: number) => ({
    title:
      hasExpansiveWidgetFilteringDates.value && header.value === 'opened'
        ? t('table_dynamic_by_filter.chats_in_period')
        : t(header.name || ''),
    itemKey: header.value,
    isSortable: true,
    size: index === 1 ? 1 : 0.5,
  }));
});

const formattedItems = computed(() => {
  if (!formattedHeaders.value?.length || !props.items?.length) return [];

  const items = props.items.map((item: any) => {
    item.status.label = item.status.status;
    return item;
  });

  const cols = visibleColumns.value || [];

  const formattedExpansiveItems = items.map((item: any) => {
    cols.forEach((columnName: string) => {
      if (columnName === 'in_progress' || columnName === 'closeds') {
        return;
      }

      if (item.custom_status && columnName in item.custom_status) {
        const breakTimeInSeconds = item.custom_status[columnName] || 0;
        item[`custom_status.${columnName}`] =
          formatSecondsToTime(breakTimeInSeconds);
      }
    });

    return item;
  });

  return sortItems(props.isExpansive ? formattedExpansiveItems : items);
});

function formatSecondsToTime(seconds: number): string {
  if (!seconds) return '00:00:00';

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  const zeroPad = (num: number) => String(num).padStart(2, '0');

  return `${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(remainingSeconds)}`;
}

function sortHeadersByVisibleColumns(headers: any[], cols: string[]) {
  return [...headers].sort((a, b) => {
    if (a.name === 'in_progress') return -1;
    if (b.name === 'in_progress') return 1;

    if (a.name === 'closeds') return -1;
    if (b.name === 'closeds') return 1;

    const indexA = cols.indexOf(a.name);
    const indexB = cols.indexOf(b.name);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }

    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return 0;
  });
}

function redirectItem(item: any) {
  const path = `${item.link.url}/insights`;
  window.parent.postMessage(
    {
      event: 'redirect',
      path,
    },
    '*',
  );
}

function sortItems(items: any[]) {
  const headerIndex = formattedHeaders.value.findIndex(
    (header: any) => header.itemKey === sort.value.itemKey,
  );

  if (!props.isExpansive) {
    const itemKeyMapper: Record<number, string> = {
      0: 'status',
      1: 'agent',
      2: 'opened',
      3: 'closed',
    };

    const itemKey = itemKeyMapper[headerIndex];

    return items.sort((a, b) => {
      if (headerIndex !== -1) {
        let valueA = a[itemKey];
        let valueB = b[itemKey];

        if (itemKey === 'status') {
          const statusMapper: Record<string, number> = {
            online: 1,
            custom: 2,
            offline: 3,
          };
          valueA = statusMapper[valueA.status] || 0;
          valueB = statusMapper[valueB.status] || 0;
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sort.value.order === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        if (valueA < valueB) return sort.value.order === 'asc' ? -1 : 1;
        if (valueA > valueB) return sort.value.order === 'asc' ? 1 : -1;
        return 0;
      } else {
        const ongoingA = a.opened;
        const ongoingB = b.opened;

        const nameA = a.agent?.toLowerCase() || '';
        const nameB = b.agent?.toLowerCase() || '';

        if (ongoingA !== ongoingB) return ongoingB - ongoingA;

        return nameA.localeCompare(nameB);
      }
    });
  } else {
    const itemKeyMapper: Record<number, string> = {
      0: 'status',
      1: 'agent',
    };

    const cols = visibleColumns.value || [];

    let columnIndex = 2;

    if (cols.includes('in_progress')) {
      itemKeyMapper[columnIndex++] = 'opened';
    }

    if (cols.includes('closeds')) {
      itemKeyMapper[columnIndex++] = 'closed';
    }

    cols
      .filter((col: string) => col !== 'in_progress' && col !== 'closeds')
      .forEach((col: string) => {
        if (
          col.startsWith('custom_status.') ||
          props.headers.some((header: any) => header.name === col)
        ) {
          itemKeyMapper[columnIndex++] = 'custom_status.' + col;
        }
      });

    const itemKey = itemKeyMapper[headerIndex];

    return items.sort((a, b) => {
      if (headerIndex !== -1) {
        let valueA = a[itemKey];
        let valueB = b[itemKey];

        if (itemKey === 'status') {
          const statusMapper: Record<string, number> = {
            online: 1,
            custom: 2,
            offline: 3,
          };
          valueA = statusMapper[valueA.status] || 0;
          valueB = statusMapper[valueB.status] || 0;
        } else if (itemKey?.startsWith('custom_status.')) {
          const statusKey = itemKey.split('.')[1];
          valueA = a.custom_status[statusKey] || 0;
          valueB = b.custom_status[statusKey] || 0;
        } else if (itemKey === 'opened') {
          valueA = a.opened;
          valueB = b.opened;
        } else if (itemKey === 'closed') {
          valueA = a.closed;
          valueB = b.closed;
        }

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sort.value.order === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        if (valueA < valueB) return sort.value.order === 'asc' ? -1 : 1;
        if (valueA > valueB) return sort.value.order === 'asc' ? 1 : -1;
        return 0;
      } else {
        const ongoingA = a.opened;
        const ongoingB = b.opened;

        const nameA = a.agent?.toLowerCase() || '';
        const nameB = b.agent?.toLowerCase() || '';

        if (ongoingA !== ongoingB) return ongoingB - ongoingA;

        return nameA.localeCompare(nameB);
      }
    });
  }
}

defineExpose({
  sort,
  hasExpansiveWidgetFilteringDates,
  formattedHeaders,
  formattedItems,
  formatSecondsToTime,
  sortHeadersByVisibleColumns,
  redirectItem,
  sortItems,
});
</script>

<style lang="scss" scoped>
.widget-human-service-agents {
  border: 1px solid $unnnic-color-gray-2;
  box-shadow: $unnnic-shadow-1;

  padding: $unnnic-space-4;

  height: 100%;

  background-color: $unnnic-color-gray-0;
  border-radius: $unnnic-radius-1;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  overflow: auto;

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
    justify-content: space-between;

    .header__title {
      font: $unnnic-font-display-3;
      color: $unnnic-color-gray-12;
    }
  }

  :deep(.widget-human-service-agents__table) {
    display: flex;
    overflow: auto;

    :hover.unnnic-table-next__body-row {
      cursor: pointer;
      background-color: $unnnic-color-gray-1;
      font-weight: $unnnic-font-weight-bold;
    }

    span[data-testid='arrow-asc-icon'] {
      color: $unnnic-color-fg-muted;
    }

    span[data-testid='arrow-desc-icon'] {
      color: $unnnic-color-fg-muted;
    }
  }

  :deep(.table-pagination) {
    display: none;
  }
}
</style>
