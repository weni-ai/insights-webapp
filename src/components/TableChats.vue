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
          v-for="(row, rowIndex) in data[activeTab]"
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
        :count="chatsCount"
        :countPages="chatsCountPages"
        :limit="chatsLimit"
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

  data: () => ({
    activeTab: 0,
    page: 1,
    tabs: ['Aguardando', 'Em andamento', 'Encerrados'],
    headers: ['Contato', 'Agente', 'Horário de início', 'Tempo de interação'],
    data: [
      [
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
        ['Fernanda da Silva Santos', 'Tamara', '12:59', '01:16'],
      ],
      [
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
        ['Monica Cristina', 'Vitória', '12:59', '01:16'],
      ],
      [
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
        ['Claudio Leal', 'Larissa', '12:59', '01:16'],
      ],
    ],
    chatsCurrentPage: 1,
    chatsCount: 10,
    chatsCountPages: 3,
    chatsLimit: 10,
  }),

  methods: {
    changeTab(index) {
      this.activeTab = index;
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
    font-size: 16px;
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
    margin-bottom: 1rem;
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
