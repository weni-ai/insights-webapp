<template>
  <section class="table-agents">
    <p class="table-agents__title">
      <unnnic-avatar-icon icon="forum" size="xs" scheme="feedback-green" />
      <span> Chats por agente </span>
    </p>

    <section class="table-agents__table">
      <header class="table-agents__headers table-agents__table-row">
        <span class="table-agents__table-col-headers"> Agente </span>
        <span class="table-agents__table-col-headers"> Chats </span>
      </header>

      <section class="table-agents__items">
        <section class="table-agents__item table-agents__table-row">
          <span class="table-agents__agent">
            <p class="table-agents__agent-name">Fabricio Correia</p>
          </span>
          <span class="table-agents__table-col-chats">
            <p>3</p>
          </span>
        </section>
        <section class="table-agents__item table-agents__table-row">
          <span class="table-agents__agent-name">
            <p>Fabricio Correia</p>
          </span>
          <span class="table-agents__table-col-chats">
            <p class="table-agents__table-col-chats">3</p>
          </span>
        </section>
        <section class="table-agents__item table-agents__table-row">
          <span class="table-agents__agent-name">
            <p>Fabricio Correia</p>
          </span>
          <span class="table-agents__table-col-chats">
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
  }

  &__headers {
    background: $unnnic-color-background-carpet;
    padding: $unnnic-spacing-inset-xs $unnnic-spacing-inset-sm;
    border-radius: $unnnic-border-radius-sm;
    font-size: $unnnic-font-size-body-gt;
  }

  &__table-row {
    display: flex;
  }

  &__table-col-headers {
    flex: 1 1;

    &:last-of-type {
      flex: 0 1 40%;
      text-align: right;
    }
  }

  &__item {
    padding: $unnnic-spacing-inset-md $unnnic-spacing-inset-sm;
    justify-content: space-between;

    &:hover {
      background: $unnnic-color-background-carpet;
      text-decoration: underline;
      text-underline-position: under;
      cursor: pointer;
    }
  }

  &__agent {
    display: flex;
    align-items: center;
    gap: $unnnic-spacing-inline-nano;
    overflow: hidden;
  }

  &__agent-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    border-bottom: 1px solid transparent;
  }

  &__table-col-chats {
    font-weight: $unnnic-font-weight-bold;
  }
}
</style>
