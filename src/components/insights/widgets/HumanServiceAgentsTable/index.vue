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
          {{ $t(headerTitle) }}
        </h1>
      </section>
      <section v-if="!isExpansive">
        <UnnnicButtonIcon
          size="small"
          icon="expand_content"
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
import { markRaw } from 'vue';

import { useAgentsColumnsFilter } from '@/store/modules/agentsColumnsFilter';

import AgentStatus from './AgentStatus.vue';
import AgentsTableHeader from './AgentsTableHeader.vue';
import { mapState } from 'pinia';

export default {
  name: 'HumanServiceAgentsTable',
  components: {
    AgentsTableHeader,
  },
  props: {
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
    isExpansive: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['seeMore'],

  data() {
    return {
      sort: { header: '', order: '' },
    };
  },

  computed: {
    ...mapState(useAgentsColumnsFilter, ['visibleColumns']),
    formattedHeaders() {
      const shownHeaders = this.headers?.filter(
        (header) => header?.display && !header?.hidden_name,
      );

      if (!shownHeaders) return [];

      if (!this.isExpansive) {
        return shownHeaders.map((header, index) => ({
          content: this.$t(header.name || ''),
          isSortable: true,
          size: index === 1 ? 1 : 0.5,
        }));
      }

      const visibleColumns = this.visibleColumns || [];

      const staticHeaders = shownHeaders.filter((header) =>
        ['status', 'agent'].includes(header.name),
      );

      const dynamicHeaders = shownHeaders.filter(
        (header) =>
          visibleColumns.includes(header.name) &&
          !['status', 'agent'].includes(header.name),
      );

      const sortedDynamicHeaders = this.sortHeadersByVisibleColumns(
        dynamicHeaders,
        visibleColumns,
      );

      const allHeaders = [...staticHeaders, ...sortedDynamicHeaders];

      return allHeaders.map((header, index) => ({
        content: this.$t(header.name?.toLowerCase() || ''),
        isSortable: true,
        size: index === 1 ? 1 : 0.5,
      }));
    },

    formattedItems() {
      if (!this.formattedHeaders?.length || !this.items?.length) return [];

      const formattedItems = this.items.map((item) => {
        const itemLabelMapper = {
          gray: 'Offline',
          green: 'Online',
        };
        item.status.label =
          item.status.label || itemLabelMapper[item.status.status];

        const baseContent = [
          {
            component: markRaw(AgentStatus),
            props: {
              status: item.status.status,
              label: item.status.label,
              agent: item.agent,
            },
            events: {},
          },
          String(item.agent),
          String(item.opened),
          String(item.closed),
        ];

        return {
          ...item,
          view_mode_url: item.link?.url,
          link: undefined,
          content: baseContent,
        };
      });

      const visibleColumns = this.visibleColumns || [];

      const formattedExpansiveItems = formattedItems.map((item) => {
        const baseContent = [
          {
            component: markRaw(AgentStatus),
            props: {
              status: item.status.status,
              label: item.status.label,
              agent: item.agent,
            },
            events: {},
          },
          String(item.agent),
        ];

        if (visibleColumns.includes('in_progress')) {
          baseContent.push(String(item.opened));
        }

        if (visibleColumns.includes('closeds')) {
          baseContent.push(String(item.closed));
        }

        visibleColumns.forEach((columnName) => {
          if (columnName === 'in_progress' || columnName === 'closeds') {
            return;
          }

          if (item.custom_status && columnName in item.custom_status) {
            const breakTimeInSeconds = item.custom_status[columnName] || 0;
            baseContent.push(this.formatSecondsToTime(breakTimeInSeconds));
          }
        });

        return {
          ...item,
          content: baseContent,
        };
      });

      return this.sortItems(
        this.isExpansive ? formattedExpansiveItems : formattedItems,
      );
    },
  },

  methods: {
    formatSecondsToTime(seconds) {
      if (!seconds) return '00:00:00';

      const totalSeconds = Math.floor(seconds);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const remainingSeconds = totalSeconds % 60;

      const zeroPad = (num) => String(num).padStart(2, '0');

      return `${zeroPad(hours)}:${zeroPad(minutes)}:${zeroPad(remainingSeconds)}`;
    },

    sortHeadersByVisibleColumns(headers, visibleColumns) {
      return [...headers].sort((a, b) => {
        if (a.name === 'in_progress') return -1;
        if (b.name === 'in_progress') return 1;

        if (a.name === 'closeds') return -1;
        if (b.name === 'closeds') return 1;

        const indexA = visibleColumns.indexOf(a.name);
        const indexB = visibleColumns.indexOf(b.name);

        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }

        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return 0;
      });
    },

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

      if (!this.isExpansive) {
        const itemKeyMapper = {
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
              const statusMapper = {
                green: 1,
                orange: 2,
                gray: 3,
              };
              valueA = statusMapper[valueA.status] || 0;
              valueB = statusMapper[valueB.status] || 0;
            }

            if (typeof valueA === 'string' && typeof valueB === 'string') {
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
      } else {
        const itemKeyMapper = {
          0: 'status',
          1: 'agent',
        };

        const visibleColumns = this.visibleColumns || [];

        let columnIndex = 2;

        if (visibleColumns.includes('in_progress')) {
          itemKeyMapper[columnIndex++] = 'opened';
        }

        if (visibleColumns.includes('closeds')) {
          itemKeyMapper[columnIndex++] = 'closed';
        }

        visibleColumns
          .filter((col) => col !== 'in_progress' && col !== 'closeds')
          .forEach((col) => {
            if (
              col.startsWith('custom_status.') ||
              this.headers.some((header) => header.name === col)
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
              const statusMapper = {
                green: 1,
                orange: 2,
                gray: 3,
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
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.widget-human-service-agents {
  border: 1px solid $unnnic-color-neutral-soft;
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
    justify-content: space-between;

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
