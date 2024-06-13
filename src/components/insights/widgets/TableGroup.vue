<template>
  <section class="table-group">
    <UnnnicTab
      :tabs="tabsName"
      :activeTab="activeTab.name"
      @change="activeTabName = $event"
    >
      <template
        v-for="tab in tabs"
        #[`tab-head-${tab.name}`]
        :key="`tab-head-${tab.name}`"
      />
      <template
        v-for="tab in tabs"
        #[`tab-panel-${tab.name}`]
        :key="`tab-panel-${tab.name}`"
      >
        <UnnnicTableNext
          v-if="activeTable.headers"
          :pagination="page === 0 ? 1 : page"
          :headers="activeTable.headers"
          :rows="activeTable.rows"
          :paginationTotal="paginationTotal"
          :isLoading="isLoading"
          @update:pagination="page = $event"
        />
      </template>
    </UnnnicTab>
  </section>
</template>

<script>
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
    return { page: 1, activeTabName: '' };
  },

  computed: {
    tabsName() {
      const tabsValues = Object.values(this.tabs);
      return tabsValues?.map((mappedConfig) => mappedConfig.name);
    },
    activeTab() {
      const tabsEntries = Object.entries(this.tabs);
      const activeTab =
        tabsEntries.find(([_key, tab]) => tab.name === this.activeTabName) ||
        tabsEntries.find(([_key, tab]) => tab.is_default);

      if (activeTab) {
        const [key, tab] = activeTab;
        return { key, ...tab };
      }

      return null;
    },
    activeTable() {
      if (!this.activeTab || !this.activeTab.fields || !this.data) {
        return {
          headers: [{ content: '' }],
          rows: [],
        };
      }

      const dynamicHeaders = this.activeTab?.fields
        ?.filter((field) => field.display && !field.hidden_name)
        .map((field) => ({ content: field.name, value: field.value }));

      const dynamicRows = this.data.map((row) => {
        const content = new Array(dynamicHeaders.length).fill(null);
        Object.entries(row).forEach(([key, value]) => {
          const index = dynamicHeaders.findIndex(
            (header) => header.value === key,
          );
          if (index !== -1) {
            content[index] = value;
          }
        });
        return { content };
      });

      return {
        headers: dynamicHeaders,
        rows: dynamicRows,
      };
    },
    paginationConfig() {
      const limit = 5;
      return {
        limit,
        offset: this.page * limit,
      };
    },
  },

  watch: {
    activeTab(newActiveTab) {
      if (this.activeTabName !== newActiveTab.name) {
        this.activeTabName = newActiveTab.name;
      }
    },
    async activeTabName() {
      const { $route } = this;
      this.page = 0;

      await this.$router.replace({
        ...$route,
        query: {
          ...$route.query,
          ...{ slug: this.activeTab.key },
        },
      });

      this.page = 1;
    },
    page(newPage) {
      if (newPage !== 0) {
        this.emitRequestData();
      }
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
