<template>
  <section class="widget-table-dynamic-by-filter">
    <header
      v-if="headerIcon && headerIconColor && headerTitle"
      class="widget-table-dynamic-by-filter__header"
    >
      <UnnnicAvatarIcon
        :icon="headerIcon"
        size="xs"
        :scheme="headerIconColor"
      />
      <h1 class="header__title">{{ $t(headerTitle) }}</h1>
    </header>

    <IconLoading
      v-if="isLoading"
      class="widget-table-dynamic-by-filter__loading-icon"
    />

    <table
      v-else
      class="widget-table-dynamic-by-filter__table"
    >
      <tr class="table__header">
        <th
          v-for="(field, index) of shownFields"
          :key="field.value"
          class="header__col"
          :class="{ main: index === 0 }"
        >
          {{ $t(field.name) }}
        </th>
      </tr>

      <section class="table__items">
        <tr
          v-for="item of orderedItems"
          :key="item.name"
          class="table__item-row"
          :class="{ 'table__item-row--clickable': item.link }"
          @click="redirectItem(item)"
        >
          <td class="item__col main">
            <UnnnicIcon
              class="col__status-icon"
              icon="indicator"
              size="sm"
              :scheme="getStatusIconScheme(item.status)"
            />
            <p>{{ item[fields[0].value] }}</p>
          </td>
          <td class="item__col">{{ item[fields[1].value] }}</td>
          <td class="item__col">{{ item[fields[2].value] }}</td>
        </tr>
      </section>
    </table>
  </section>
</template>

<script>
import IconLoading from '@/components/IconLoading.vue';

export default {
  name: 'WidgetTableDynamicByFilter',

  components: {
    IconLoading,
  },

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
    fields: {
      type: Array,
      default: () => [],
    },
    items: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    shownFields() {
      return this.fields.filter((field) => field.display && !field.hidden_name);
    },
    orderedItems() {
      const greenStatus = this.items.filter(
        (item) => item.status.toLowerCase() === 'green',
      );
      const grayStatus = this.items.filter(
        (item) => item.status.toLowerCase() === 'gray',
      );

      const sortKey = this.fields[0].value;

      greenStatus.sort((a, b) => a[sortKey].localeCompare(b[sortKey]));
      grayStatus.sort((a, b) => a[sortKey].localeCompare(b[sortKey]));

      return greenStatus.concat(grayStatus);
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

  &__loading-icon {
    margin: auto;
  }

  &__table {
    display: flex;
    flex-direction: column;
    justify-content: stretch;

    overflow: hidden;

    .table__header,
    .table__item-row {
      display: grid;
      grid-template-columns: 2fr repeat(2, 1fr);
      justify-items: center;
      align-items: center;
      gap: $unnnic-spacing-xs;

      cursor: default;

      &--clickable {
        cursor: pointer;
      }

      .header__col,
      .item__col {
        color: $unnnic-color-neutral-cloudy;
        font-family: Lato;
        font-size: $unnnic-font-size-body-gt;
        font-weight: $unnnic-font-weight-regular;

        white-space: nowrap;

        &.main {
          justify-self: start;
        }
      }
    }

    .table__header {
      padding: $unnnic-spacing-ant $unnnic-spacing-sm;

      background-color: $unnnic-color-neutral-lightest;
      border-radius: $unnnic-border-radius-sm;
    }

    .table__items {
      height: 100%;
      overflow: auto;
    }

    .table__item-row {
      .item__col {
        padding: $unnnic-spacing-ant 0;

        &.main {
          display: flex;
          align-items: center;
          gap: $unnnic-spacing-nano;

          .col__status-icon {
            margin: $unnnic-spacing-nano;
          }
        }

        cursor: inherit;
      }

      &:hover {
        background-color: $unnnic-color-weni-50;

        .item__col.main {
          font-weight: $unnnic-font-weight-bold;
          text-decoration-line: underline;
          text-underline-position: under;
        }
      }
    }
  }
}
</style>
