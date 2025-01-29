<template>
  <section class="widget-human-service-agents">
    <header
      v-if="headerTitle"
      class="widget-human-service-agents__header"
    >
      <h1
        class="header__title"
        data-testid="widget-human-service-agent-title"
      >
        {{ $t(headerTitle) }}
      </h1>
    </header>

    <UnnnicTableNext
      class="widget-human-service-agents__table"
      :isLoading="isLoading"
      :locale="$i18n.locale"
      :headers="formattedHeaders"
      :rows="formattedItems"
      data-testid="human-service-agents-table"
      @row-click="redirectItem($event)"
      @sort="sort = $event"
    />
  </section>
</template>

<script>
import AgentStatus from './AgentStatus.vue';
import { markRaw } from 'vue';

export default {
  name: 'HumanServiceAgentsTable',

  props: {
    isLoading: Boolean,
    headerTitle: {
      type: String,
      default: '',
    },
    headers: {
      type: Array,
      required: true,
    },
    items: {
      type: Array,
      required: true,
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
        size: index === 1 ? 1 : 0.4,
      }));
    },

    formattedItems() {
      if (!this.formattedHeaders?.length || !this.items?.length) return [];

      const formattedItems = this.items.map((item) => ({
        ...item,
        view_mode_url: item.link.url,
        link: undefined,
        content: [
          { component: markRaw(AgentStatus), props: { status: item.status } },
          String(item.agent),
          String(item.opened),
          String(item.closed),
        ],
      }));

      return this.sortItems(formattedItems);
    },
  },

  methods: {
    redirectItem(item) {
      const path = `${item.view_mode_url}/insights`;
      window.parent.postMessage(
        {
          event: 'redirect',
          path,
        },
        '*',
      );
    },

    sortItems(items) {
      const headerIndex = this.formattedHeaders.findIndex(
        (header) => header.content === this.sort.header,
      );

      const itemKeyMapper = {
        0: 'status',
        1: 'agent',
        2: 'opened',
        3: 'closed',
      };

      const itemKey = itemKeyMapper[headerIndex];

      return items.sort((a, b) => {
        if (headerIndex !== -1) {
          const valueA = a[itemKey];
          const valueB = b[itemKey];

          if ((typeof valueA === 'string') & (typeof valueB === 'string')) {
            return this.sort.order === 'asc'
              ? valueA.localeCompare(valueB)
              : valueB.localeCompare(valueA);
          }

          if (valueA < valueB) return this.sort.order === 'asc' ? -1 : 1;
          if (valueA > valueB) return this.sort.order === 'asc' ? 1 : -1;
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
    },
  },
};
</script>

<style lang="scss" scoped>
.widget-human-service-agents {
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
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size;
      color: $unnnic-color-neutral-darkest;
      font-weight: $unnnic-font-weight-bold;
      line-height: $unnnic-font-size-title-md;
    }
  }

  :deep(.widget-human-service-agents__table) {
    display: flex;
    overflow: auto;

    :hover.unnnic-table-next__body-row {
      cursor: pointer;
      background-color: $unnnic-color-neutral-lightest;
      font-weight: $unnnic-font-weight-bold;
    }

    span[data-testid='arrow-asc-icon'] {
      color: $unnnic-color-neutral-cloudy;
    }

    span[data-testid='arrow-desc-icon'] {
      color: $unnnic-color-neutral-cloudy;
    }
  }

  :deep(.table-pagination) {
    display: none;
  }
}
</style>
