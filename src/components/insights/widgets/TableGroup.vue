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
        {{ $t(tab.name) }}
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

<script>
import moment from 'moment';

import TagGroup from '@/components/TagGroup.vue';

export default {
  name: 'TableGroup',

  components: {
    // eslint-disable-next-line vue/no-unused-components
    TagGroup,
  },

  props: {
    isLoading: Boolean,
    tabs: {
      type: Object,
      default: () => ({
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
    },
    data: {
      type: Array,
      default: () => [],
    },
    paginationTotal: {
      type: Number,
      default: 0,
    },
  },

  emits: ['request-data'],

  data() {
    return { page: 0, paginationInterval: 5, activeTabName: '' };
  },

  computed: {
    tabsKeys() {
      const tabsKeys = Object.keys(this.tabs);
      return tabsKeys;
    },
    activeTab() {
      const tabsEntries = Object.entries(this.tabs);

      const activeTab =
        tabsEntries.find(([key, _tab]) => key === this.activeTabName) ||
        tabsEntries.find(([_key, tab]) => tab.is_default);

      if (activeTab) {
        const [key, tab] = activeTab;
        return { key, ...tab };
      }

      return null;
    },
    activeTable() {
      const { activeTab, data } = this;

      if (!activeTab || !activeTab.fields || !data) {
        return {
          headers: [{ content: '' }],
          rows: [],
        };
      }

      const formatRowValue = (value) => {
        if (value === null || value === undefined) {
          return '-';
        }

        const isDateValid = (date) => moment(date, moment.ISO_8601).isValid();

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
          const formattedDate = moment(value).format(this.$t('date_format'));
          const formattedTime = moment(value).format('HH:mm');
          return `${formattedTime} | ${formattedDate}`;
        }

        return value;
      };

      const dynamicHeaders = activeTab?.fields
        ?.filter((field) => field.display && !field.hidden_name)
        .map((field) => ({ content: this.$t(field.name), value: field.value }));

      const dynamicRows = data.map((row) => {
        const content = dynamicHeaders.map((header) =>
          formatRowValue(row?.[header?.value]),
        );
        return { ...row, link: undefined, url_link: row?.link?.url, content };
      });

      return {
        headers: dynamicHeaders,
        rows: dynamicRows,
      };
    },
    paginationConfig() {
      const limit = this.paginationInterval;
      return {
        limit,
        offset: this.page * limit,
      };
    },
  },

  watch: {
    '$route.query': {
      handler(query, oldQuery) {
        if (!query?.slug) return;

        if (query.slug !== oldQuery?.slug) this.page = 0;

        this.emitRequestData();
      },
    },
    async activeTabName() {
      const { $route } = this;

      await this.$router.replace({
        ...$route,
        query: {
          ...$route.query,
          ...{
            slug: this.activeTab?.key,
            offset: this.paginationConfig.offset,
            limit: this.paginationConfig.limit,
          },
        },
      });
    },
    page: {
      handler() {
        this.$router.replace({
          ...this.$route,
          query: {
            ...this.$route.query,
            ...{
              slug: this.activeTab?.key,
              offset: this.paginationConfig.offset,
              limit: this.paginationConfig.limit,
            },
          },
        });
      },
    },
  },

  created() {
    if (this.$route.query.offset) {
      const page = Number(this.$route.query.offset) / this.paginationInterval;
      this.page = page || 0;
    }
  },

  unmounted() {
    this.$router.replace({
      ...this.$route,
      slug: undefined,
      offset: undefined,
      limit: undefined,
    });
  },

  mounted() {
    const { slug } = this.$route.query;
    if (slug) this.changeActiveTabName(slug);
    else {
      Object.keys(this.tabs).forEach((tabKey) => {
        if (this.tabs[tabKey].is_default) this.changeActiveTabName(tabKey);
      });
    }
    if (this.$route.query.slug) this.emitRequestData();
  },

  methods: {
    changeActiveTabName(newActiveTabName) {
      this.activeTabName = newActiveTabName;
    },
    emitRequestData() {
      const { offset, limit } = this.paginationConfig;
      this.$emit('request-data', { offset, limit });
    },
    rowClick(row) {
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
    },
  },
};
</script>

<style lang="scss" scoped>
.table-group {
  overflow-y: auto;

  :deep(.table-group__table-in_progress) {
    display: flex;
    overflow: auto;

    :hover.unnnic-table-next__body-row {
      cursor: pointer;
      background-color: $unnnic-color-neutral-lightest;
      font-weight: $unnnic-font-weight-bold;
    }
  }
}
</style>
