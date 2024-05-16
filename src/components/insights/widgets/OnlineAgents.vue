<template>
  <section class="widget-online-agents">
    <header class="widget-online-agents__header">
      <UnnnicAvatarIcon
        icon="forum"
        size="xs"
        scheme="color-weni-600"
      />
      <h1 class="header__title">Agentes online</h1>
    </header>

    <table class="widget-online-agents__table">
      <tr class="table__header">
        <th class="header__col main">Agente</th>
        <th class="header__col">Em andamento</th>
        <th class="header__col">Encerrados</th>
      </tr>

      <section class="table__agents">
        <tr
          class="table__agent-row"
          v-for="agent of orderedAgents"
          :key="agent.name"
        >
          <td class="agent__col main">
            <UnnnicIcon
              class="col__status-icon"
              icon="indicator"
              size="sm"
              :scheme="getStatusIconScheme(agent.agent_status)"
            />
            <p>{{ agent.first_name }} {{ agent.last_name }}</p>
          </td>
          <td class="agent__col">{{ agent.rooms_in_progress }}</td>
          <td class="agent__col">{{ agent.rooms_closed }}</td>
        </tr>
      </section>
    </table>
  </section>
</template>

<script>
import onlineAgentsData from '@/mocks/widgetOnlineAgentsData.json';
export default {
  name: 'WidgetOnlineAgents',

  data() {
    return {
      onlineAgentsData,
    };
  },

  computed: {
    orderedAgents() {
      const agents = onlineAgentsData;
      const onlineAgents = agents.filter(
        (agent) => agent.agent_status.toLowerCase() === 'online',
      );
      const offlineAgents = agents.filter(
        (agent) => agent.agent_status.toLowerCase() === 'offline',
      );

      onlineAgents.sort((a, b) => a.first_name.localeCompare(b.first_name));
      offlineAgents.sort((a, b) => a.first_name.localeCompare(b.first_name));

      return onlineAgents.concat(offlineAgents);
    },
  },

  methods: {
    getStatusIconScheme(status) {
      return `feedback-${
        status?.toLowerCase() === 'online' ? 'green' : 'grey'
      }`;
    },
  },
};
</script>

<style lang="scss" scoped>
.widget-online-agents {
  height: 100%;

  background-color: $unnnic-color-background-snow;
  border-radius: $unnnic-border-radius-sm;

  display: grid;
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

  &__table {
    display: flex;
    flex-direction: column;
    justify-content: stretch;

    overflow: hidden;

    .table__header,
    .table__agent-row {
      display: grid;
      grid-template-columns: 2fr repeat(2, 1fr);
      justify-items: center;
      align-items: center;
      gap: $unnnic-spacing-xs;

      .header__col,
      .agent__col {
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

    .table__agents {
      height: 100%;
      overflow: auto;
    }

    .table__agent-row {
      .agent__col {
        padding: $unnnic-spacing-ant 0;

        &.main {
          display: flex;
          align-items: center;
          gap: $unnnic-spacing-nano;

          .col__status-icon {
            margin: $unnnic-spacing-nano;
          }
        }

        cursor: default;
      }

      &:hover {
        background-color: $unnnic-color-weni-50;

        .agent__col.main {
          font-weight: $unnnic-font-weight-bold;
          text-decoration-line: underline;
          text-underline-position: under;
        }
      }
    }
  }
}
</style>
