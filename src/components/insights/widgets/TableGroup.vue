<template>
  <section class="table-group">
    <UnnnicTab
      data-testid="tab"
      :tabs="tabsKeys"
      :activeTab="activeTabName"
      @change="changeActiveTabName"
    >
      <template
        v-for="[key, tab] in Object.entries(tabs)"
        #[`tab-head-${key}`]
        :key="`tab-head-${key}`"
      >
        {{ t(tab.name) }}
      </template>
      <template
        v-for="key in Object.keys(tabs)"
        #[`tab-panel-${key}`]
        :key="`tab-panel-${key}`"
      >
        <UnnnicTableNext
          v-if="activeTable.headers"
          :class="`table-group__table-${key}`"
          data-testid="table"
          :pagination="page + 1"
          :headers="activeTable.headers"
          :rows="activeTable.rows"
          :paginationTotal="paginationTotal"
          :paginationInterval="paginationInterval"
          :isLoading="isLoading"
          @update:pagination="page = $event - 1"
          @row-click="rowClick"
        />
      </template>
    </UnnnicTab>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import moment from 'moment';

import TagGroup from '@/components/TagGroup.vue';

defineOptions({ name: 'TableGroup' });

const props = withDefaults(
  defineProps<{
    isLoading?: boolean;
    tabs?: Record<string, any>;
    data?: any[];
    paginationTotal?: number;
  }>(),
  {
    isLoading: false,
    tabs: () => ({
      key: {
        fields: [
          {
            display: false,
            hidden_name: false,
            name: '',
            value: '',
          },
        ],
        filter: null,
        is_default: false,
        name: '',
      },
    }),
    data: () => [],
    paginationTotal: 0,
  },
);

const emit = defineEmits<{
  (e: 'request-data', payload: { offset: number; limit: number }): void;
}>();

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const page = ref(0);
const paginationInterval = ref(5);
const activeTabName = ref('');

const tabsKeys = computed(() => {
  return Object.keys(props.tabs);
});

const activeTab = computed(() => {
  const tabsEntries = Object.entries(props.tabs);

  const found =
    tabsEntries.find(([key]) => key === activeTabName.value) ||
    tabsEntries.find(([, tab]) => tab.is_default);

  if (found) {
    const [key, tab] = found;
    return { key, ...tab };
  }

  return null;
});

const activeTable = computed(() => {
  const tab = activeTab.value;
  const data = props.data;

  if (!tab || !tab.fields || !data) {
    return {
      headers: [{ content: '' }],
      rows: [],
    };
  }

  const formatRowValue = (value: any) => {
    if (value === null || value === undefined) {
      return '-';
    }

    const isDateValid = (date: any) => moment(date, moment.ISO_8601).isValid();

    if (Array.isArray(value)) {
      return {
        component: TagGroup,
        props: {
          tags: value,
          flex: false,
        },
        events: {},
      };
    }

    if (isDateValid(value)) {
      const formattedDate = moment(value).format(t('date_format'));
      const formattedTime = moment(value).format('HH:mm');
      return `${formattedTime} | ${formattedDate}`;
    }

    return value;
  };

  const dynamicHeaders = tab?.fields
    ?.filter((field: any) => field.display && !field.hidden_name)
    .map((field: any) => ({ content: t(field.name), value: field.value }));

  const dynamicRows = data.map((row: any) => {
    const content = dynamicHeaders.map((header: any) =>
      formatRowValue(row?.[header?.value]),
    );
    return { ...row, link: undefined, url_link: row?.link?.url, content };
  });

  return {
    headers: dynamicHeaders,
    rows: dynamicRows,
  };
});

const paginationConfig = computed(() => {
  const limit = paginationInterval.value;
  return {
    limit,
    offset: page.value * limit,
  };
});

function handleRouteQuery(query: any, oldQuery?: any) {
  if (!query?.slug) return;

  if (query.slug !== oldQuery?.slug) page.value = 0;

  emitRequestData();
}

watch(
  () => route.query,
  (query, oldQuery) => {
    handleRouteQuery(query, oldQuery);
  },
);

watch(activeTabName, async () => {
  await router.replace({
    ...route,
    query: {
      ...route.query,
      slug: activeTab.value?.key,
      offset: paginationConfig.value.offset,
      limit: paginationConfig.value.limit,
    },
  });
});

watch(page, () => {
  router.replace({
    ...route,
    query: {
      ...route.query,
      slug: activeTab.value?.key,
      offset: paginationConfig.value.offset,
      limit: paginationConfig.value.limit,
    },
  });
});

if (route.query.offset) {
  const p = Number(route.query.offset) / paginationInterval.value;
  page.value = p || 0;
}

onMounted(() => {
  const { slug } = route.query;
  if (slug) changeActiveTabName(slug as string);
  else {
    Object.keys(props.tabs).forEach((tabKey) => {
      if (props.tabs[tabKey].is_default) changeActiveTabName(tabKey);
    });
  }
  if (route.query.slug) emitRequestData();
});

onUnmounted(() => {
  router.replace({
    ...route,
    slug: undefined,
    offset: undefined,
    limit: undefined,
  } as any);
});

function changeActiveTabName(newActiveTabName: string) {
  activeTabName.value = newActiveTabName;
}

function emitRequestData() {
  const { offset, limit } = paginationConfig.value;
  emit('request-data', { offset, limit });
}

function rowClick(row: any) {
  if (row.url_link) {
    const url = `${row.url_link}/insights`;

    window.parent.postMessage(
      {
        event: 'redirect',
        path: url,
      },
      '*',
    );
  }
}

defineExpose({
  page,
  paginationInterval,
  activeTabName,
  tabsKeys,
  activeTab,
  activeTable,
  paginationConfig,
  changeActiveTabName,
  emitRequestData,
  rowClick,
  handleRouteQuery,
});
</script>

<style lang="scss" scoped>
.table-group {
  overflow-y: auto;

  :deep(.table-group__table-in_progress) {
    display: flex;
    overflow: auto;

    :hover.unnnic-table-next__body-row {
      cursor: pointer;
      background-color: $unnnic-color-gray-1;
      font-weight: $unnnic-font-weight-bold;
    }
  }
}
</style>
