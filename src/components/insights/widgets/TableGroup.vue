<template>
  <section class="table-group">
    <UnnnicTab
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
          :pagination="page + 1"
          :headers="activeTable.headers"
          :rows="activeTable.rows"
          :paginationTotal="paginationTotal"
          :paginationInterval="paginationInterval"
          :isLoading="isLoading"
          @update:pagination="page = $event - 1"
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
        const isDateValid = (date) => !isNaN(new Date(date));

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
          formatRowValue(row[header.value]),
        );
        return { content };
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
    '$route.query'() {
      this.page = 0;
      this.emitRequestData();
    },
    async activeTabName() {
      const { $route } = this;

      await this.$router.replace({
        ...$route,
        query: {
          ...$route.query,
          ...{ slug: this.activeTab.key },
        },
      });

      this.page = 0;
    },
    page: {
      handler() {
        this.emitRequestData();
      },
    },
  },

  unmounted() {
    const newQuery = this.$route.query;
    delete newQuery.slug;
    this.$router.replace({
      ...this.$route,
      query: newQuery,
    });
  },

  methods: {
    changeActiveTabName(newActiveTabName) {
      this.activeTabName = newActiveTabName;
    },
    emitRequestData() {
      const { offset, limit } = this.paginationConfig;
      this.$emit('request-data', { offset, limit });
    },
  },
};
</script>

<style lang="scss" scoped>
.table-group {
  overflow-y: auto;
}
</style>
