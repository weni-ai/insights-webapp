<template>
  <section class="agent-chats">
    <header class="agent-chats__header">
      <unnnic-avatar-icon icon="chat" scheme="brand-weni" />
      <h1>Chats por agente</h1>
    </header>
    <unnnic-table
      v-bind="$props"
      :items="table.items"
      :style="{ maxHeight: '280px', maxWidth: '380px' }"
    >
      <template v-slot:header>
        <unnnic-table-row :headers="table.headers" />
      </template>

      <template v-slot:item="{ item }">
        <unnnic-table-row :headers="table.headers">
          <template v-slot:checkarea>
            <unnnic-checkbox
              v-model="item.selected"
              :style="{ margin: '4px' }"
            />
          </template>

          <template v-slot:agent>
            <div :title="item.agent" class="break-text">
              {{ item.agent }}
            </div>
          </template>

          <template v-slot:chats>
            <div :title="item.chats" class="break-text">
              {{ item.chats }}
            </div>
          </template>
        </unnnic-table-row>
      </template>
    </unnnic-table>
  </section>
</template>

<script>
export default {
  name: 'AgentChats',

  data: () => ({
    table: {
      headers: [
        {
          id: 'agent',
          text: 'Agente',
          flex: 2,
        },
        {
          id: 'chats',
          text: 'Chats',
          flex: 1,
        },
      ],
      items: [
        {
          selected: false,
          agent: 'Fabricio Correia',
          chats: '3',
        },
        {
          selected: false,
          agent: 'John Doe',
          chats: '2',
        },
        {
          selected: false,
          agent: 'Daniela Maciel',
          chats: '4',
        },
      ],
    },
  }),
};
</script>

<style lang="scss" scoped>
.agent-chats {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-ant;
  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: $unnnic-spacing-ant;
  }
}
</style>
