<template>
  <!-- Copied from weni-webapp. Temporary component, so corrections (good practices) here are not necessary -->
  <div class="connect-topbar">
    <div class="connect-topbar__greetings">
      <img
        src="../../assets/images/connect/waving-hand.png"
        alt="Waving Hand Emoji"
        class="greetings__emoji"
      />

      <div class="u font title-sm color-neutral-darkest">
        Boas vindas, Luana!
      </div>
    </div>

    <div :style="{ display: 'flex', alignItems: 'center' }">
      <UnnnicSelectSmart
        v-model="org"
        class="connect-topbar__select"
        disabled
        size="sm"
      />

      <UnnnicSelectSmart
        v-model="project"
        class="connect-topbar__select"
        disabled
        size="sm"
      />

      <UnnnicIconSvg
        icon="school"
        scheme="neutral-dark"
        class="connect-topbar__item"
      />

      <UnnnicIconSvg
        icon="help"
        scheme="neutral-dark"
        class="connect-topbar__item"
      />

      <UnnnicIconSvg
        icon="notifications"
        scheme="neutral-dark"
        class="connect-topbar__item"
      />

      <img
        src="../../assets/images/connect/default-avatar.svg"
        class="connect-topbar__avatar"
        :style="{ margin: 0 }"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConnectTopbar',

  data() {
    return {
      org: [{ value: '', label: 'Organização' }],
      project: [{ value: '', label: 'Projeto' }],
    };
  },
};
</script>

<style lang="scss">
.connect-topbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  padding: $unnnic-spacing-md $unnnic-spacing-md $unnnic-spacing-md 0;

  background-color: $unnnic-color-background-sky;

  &__greetings {
    display: flex;
    align-items: center;
    column-gap: $unnnic-spacing-inline-nano;
    margin-right: auto;

    &__emoji {
      height: $unnnic-font-size-title-sm;
    }
  }

  &__select {
    width: 11.5rem;
    z-index: 0;
    margin: 0 $unnnic-spacing-sm 0 0;
  }

  &__item {
    margin-right: $unnnic-inline-md;

    cursor: pointer;
  }

  &__avatar {
    height: 40px;
    width: 40px;

    cursor: pointer;
  }
}
</style>
