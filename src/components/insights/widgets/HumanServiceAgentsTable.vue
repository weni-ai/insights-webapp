<template>
  <section class="widget-table-dynamic-by-filter">
    <header
      v-if="headerTitle"
      class="widget-table-dynamic-by-filter__header"
    >
      <h1 class="header__title">{{ $t(headerTitle) }}</h1>
    </header>

    {{ sort }}

    <UnnnicTableNext
      class="widget-table-dynamic-by-filter__table"
      :isLoading="isLoading"
      :locale="$i18n.locale"
      :headers="formattedHeaders"
      :rows="formattedItems"
      @click-row="($event) => console.log('clicked', $event)"
      @sort="sort = $event"
    />
  </section>
</template>

<script>
export default {
  name: 'WidgetTableDynamicByFilter',

  props: {
    isLoading: Boolean,
    headerIcon: {
      type: String,
      default: '',
    },
    headerIconColor: {
      type: String,
      default: '',
    },
    headerTitle: {
      type: String,
      default: '',
    },
    headers: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      sort: { header: '', order: '' },
    };
  },

  computed: {
    formattedHeaders() {
      const shownHeaders = this.headers?.filter(
        (header) => header.display && !header.hidden_name,
      );

      if (!shownHeaders) return [];

      return shownHeaders.map((header, index) => ({
        content: this.$t(header.name),
        isSortable: true,
        size: index === 0 ? 1 : 0.5,
      }));
    },

    formattedItems() {
      if (!this.formattedHeaders.length || !this.items.length) return [];

      const formattedItems = this.items.map((item) => ({
        ...item,
        content: [item.agent, item.opened, item.closed],
      }));

      return this.sortItems(formattedItems);
    },
  },

  methods: {
    getStatusIconScheme(status) {
      return `feedback-${status?.toLowerCase() === 'green' ? 'green' : 'grey'}`;
    },

    redirectItem(item) {
      if (!item?.link) {
        return;
      }

      const isAnotherModule = /^(chats:|integrations:|connect:|academy:)/;

      const internalRedirect = () => {
        if (isAnotherModule.test(item.link.url)) {
          const path = `${item.link.url}/insights`;
          window.parent.postMessage(
            {
              event: 'redirect',
              path,
            },
            '*',
          );
        } else {
          this.$router.push(item.link.url);
        }
      };

      const externalRedirect = () => {
        window.open(item.link.url, '_blank');
      };

      const redirectMap = {
        internal: () => internalRedirect(),
        external: () => externalRedirect(),
      };

      const redirectAction = redirectMap[item.link.type];
      if (redirectAction) redirectAction();
    },

    sortItems(items) {
      if (!this.sort.order && !this.sort.header) {
        return items.sort((a, b) => {
          const ongoingA = a.content[1];
          const ongoingB = b.content[1];

          const nameA = a.content[0]?.toLowerCase() || '';
          const nameB = b.content[0]?.toLowerCase() || '';

          if (ongoingA !== ongoingB) return ongoingB - ongoingA;

          return nameA.localeCompare(nameB);
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.widget-table-dynamic-by-filter {
  box-shadow: $unnnic-shadow-level-far;

  padding: $unnnic-spacing-sm;

  height: 100%;

  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-sm;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  overflow: auto;

  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-stack-xs;

    .header__title {
      font-family: $unnnic-font-family-primary;
      font-size: $unnnic-font-size-title-sm;
      color: $unnnic-color-neutral-darkest;
    }
  }

  :deep(.widget-table-dynamic-by-filter__table) {
    display: flex;
    overflow: auto;
  }

  :deep(.table-pagination) {
    display: none;
  }
}
</style>
