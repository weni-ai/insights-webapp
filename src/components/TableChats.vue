<template>
  <section class="table-chats">
    <header class="table-chats__tab-buttons">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        @click="changeTab(index)"
        :class="{ active: activeTab === index }"
        class="table-chats__tab-button"
      >
        {{ tab }}
      </button>
    </header>
    <table class="table-chats__table">
      <thead class="table-chats__table-head">
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody class="table-chats__table-body">
        <tr
          v-for="(row, rowIndex) in tableData"
          :key="rowIndex"
          class="table-chats__table-row"
        >
          <td v-for="(value, colIndex) in row" :key="colIndex">{{ value }}</td>
        </tr>
      </tbody>
    </table>
    <hr class="table-chats__separator" />
    <footer class="table-chats__bottom">
      <TablePagination
        v-model="chatsCurrentPage"
        :value="chatsCurrentPage"
        :count="chatsCount"
        :countPages="
          getTotalPages(Object.keys(this.data.chats.status)[this.activeTab])
        "
        :limit="chatsLimit"
        @updatePage="updatePage"
      />
    </footer>
  </section>
</template>

<script>
import TablePagination from '@/components/TablePagination.vue';

export default {
  name: 'TableChats',

  components: {
    TablePagination,
  },

  data() {
    return {
      tableData: [],
      tabData: [],
      activeTab: 0,
      chatsCurrentPage: 1,
      chatsCount: 0,
      chatsCountPages: 0,
      chatsLimit: 10,
    };
  },

  props: {
    tabs: {
      type: Array,
      default: () => ['Aguardando', 'Em progresso', 'Encerrado'],
    },
    headers: {
      type: Array,
      default: () => [
        'Contato',
        'Agente',
        'Horário de início',
        'Tempo de interação',
      ],
    },
    data: {
      type: Object,
      required: true,
    },
  },

  methods: {
    changeTab(index) {
      this.activeTab = index;
      this.chatsCurrentPage = 1;
    },

    updateTableData(tabs) {
      const tabData = this.data.chats.status[tabs];
      const startIndex = (this.chatsCurrentPage - 1) * this.chatsLimit;
      const endIndex = startIndex + this.chatsLimit;

      this.chatsCount = tabData.length;
      this.tableData = tabData.slice(startIndex, endIndex).map((item) => ({
        contact: item.contact,
        agent: item.agent,
        start_time: item.start_time,
        interaction_time: item.interaction_time,
      }));
    },

    getTotalPages(tabs) {
      const tabData = this.data.chats.status[tabs];
      if (tabData && tabData.length) {
        const totalPagesPerItems = Math.ceil(tabData.length / this.chatsLimit);
        return totalPagesPerItems;
      } else {
        return 1;
      }
    },

    updateTab(value) {
      const statusKey = Object.keys(this.data.chats.status);
      const status = statusKey?.[value];
      return this.updateTableData(status);
    },

    updatePage(page) {
      this.chatsCurrentPage = page;
      this.updateTab(this.activeTab);
    },
  },

  mounted() {
    this.updateTab(this.activeTab);
  },

  watch: {
    activeTab(newValue) {
      this.updateTab(newValue);
    },
  },
};
</script>

<style lang="scss" scoped>
.table-chats {
  border: 1px solid $unnnic-color-neutral-cleanest;
  background-color: $unnnic-color-neutral-white;

  &__tab-buttons {
    width: 100%;
    display: flex;
    flex-direction: row;
  }

  &__tab-button {
    width: 100%;
    font-size: $unnnic-font-size-body-lg;
    border: 1px solid $unnnic-color-neutral-cleanest;
    background-color: $unnnic-color-neutral-lightest;
    cursor: pointer;
    text-align: left;
    color: $unnnic-color-neutral-cloudy;
    font-weight: $unnnic-font-weight-bold;
    padding: $unnnic-spacing-ant $unnnic-spacing-sm;
  }
  .active {
    background-color: $unnnic-color-neutral-white;
    color: $unnnic-color-neutral-darkest;
    border-bottom: none;
  }

  &__table {
    width: -webkit-fill-available;
    border-collapse: collapse;
    color: $unnnic-color-neutral-black;
    text-align: left;
    margin: $unnnic-spacing-ant $unnnic-spacing-sm;
    font-size: $unnnic-font-size-body-gt;
  }
  &__table-head {
    margin-bottom: $unnnic-spacing-sm;
  }
  &__table-row {
    height: $unnnic-spacing-lg;
    margin: $unnnic-spacing-ant;
    align-self: stretch;
    color: $unnnic-color-neutral-dark;
  }
  &__separator {
    border: 1px solid $unnnic-color-neutral-soft;
    border-radius: $unnnic-spacing-nano;
    height: 1px;
    margin: $unnnic-spacing-ant $unnnic-spacing-sm;
  }
  &__bottom {
    display: flex;
    align-items: center;
    margin: $unnnic-spacing-md $unnnic-spacing-sm;
    place-content: space-between;
  }
}
</style>
