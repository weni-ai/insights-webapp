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
          v-model:pagination="pagination"
          :headers="activeTable.headers"
          :rows="activeTable.rows"
          :paginationTotal="paginationTotal"
          :isLoading="isLoading"
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
      type: Array,
      default: () => [
        {
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
      ],
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

  data() {
    return { pagination: 1, activeTabName: '' };
  },

  computed: {
    tabsName() {
      return this.tabs?.map((mappedConfig) => mappedConfig.name);
    },
    activeTab() {
      return (
        this.tabs.find((tab) => tab.name === this.activeTabName) ||
        this.tabs.find((tab) => tab.is_default)
      );
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
  },

  watch: {
    activeTab(newActiveTab) {
      if (this.activeTabName !== newActiveTab.name) {
        this.activeTabName = newActiveTab.name;
      }
    },
    activeTabName() {
      const { $route } = this;
      this.$router.replace({
        ...$route,
        query: {
          ...$route.query,
          ...{ slug: this.activeTab.slug },
        },
      });
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
};
</script>

<style lang="scss" scoped>
.table-group {
  overflow-y: auto;
}
</style>
