<template>
  <section class="table-agents">
    <p class="table-agents__title">
      <unnnic-avatar-icon icon="forum" size="xs" scheme="feedback-green" />
      <span> Chats por agente </span>
    </p>

    <section class="table-agents__table">
      <header class="headers table-row">
        <span class="header table-col"> Agente </span>
        <span class="header table-col"> Chats </span>
      </header>

      <section class="items">
        <section class="item table-row">
          <span class="table-col agent">
            <p>Fabricio Correia</p>
          </span>
          <span class="table-col" style="text-align: center">
            <p>3</p>
          </span>
        </section>
      </section>
    </section>
  </section>
</template>

<script>
export default {
  name: 'AgentChats',

  data: () => ({}),
};
</script>

<style lang="scss" scoped>
.table-agents {
  background: $unnnic-color-background-snow;
  padding: $unnnic-spacing-inset-sm;
  border-radius: $unnnic-border-radius-sm;

  &__title {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-stack-xs;
    font-size: $unnnic-font-size-title-sm;
    color: $unnnic-color-neutral-darkest;
    margin-bottom: $unnnic-spacing-inline-sm;
  }

  &__table {
    color: $unnnic-color-neutral-cloudy;
    font-size: $unnnic-font-size-body-gt;

    .table-row {
      display: flex;

      .table-col {
        flex: 1 1;

        &:last-of-type {
          flex: 0 1 40%;
          text-align: center;
        }
      }
    }

    .headers {
      background: $unnnic-color-background-carpet;
      padding: $unnnic-spacing-inset-xs $unnnic-spacing-inset-sm;
      border-radius: $unnnic-border-radius-sm;
    }

    .items {
      .item {
        padding: $unnnic-spacing-inset-md $unnnic-spacing-inset-sm;

        .table-col {
          &.agent {
            display: flex;
            align-items: center;
            gap: $unnnic-spacing-inline-nano;
            overflow: hidden;

            p {
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              border-bottom: 1px solid transparent;
            }
          }
        }

        &:hover {
          background: $unnnic-color-background-carpet;
          text-decoration: underline;
          text-underline-position: under;

          cursor: pointer;

          .agent > p {
            border-bottom: 1px solid $unnnic-color-neutral-cloudy;
          }
        }
      }
    }
  }
}
</style>
