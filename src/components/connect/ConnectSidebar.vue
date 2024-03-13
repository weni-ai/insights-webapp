<template>
  <!-- Copied from weni-webapp. Temporary component, so corrections (good practices) here are not necessary -->
  <unnnic-sidebar-primary
    class="connect-sidebar"
    :languages="['pt-br', 'en', 'es']"
    language="pt-br"
    :hide-expand-button="true"
    :expanded="open"
    @toggle-expanded="open = $event"
    :hide-text="open ? 'Encolher' : 'Expandir'"
    :items="categories"
  >
    <template v-slot:header>
      <div class="connect-sidebar__header">
        <img src="../../assets/images/Logo-Weni.svg" />
      </div>
    </template>
  </unnnic-sidebar-primary>
</template>

<script>
export default {
  name: 'ConnectSidebar',

  data() {
    return {
      open: false,
    };
  },

  computed: {
    categories() {
      return [
        {
          label: 'Menu principal',
          items: [
            {
              label: 'Início',
              active: false,
              icon: 'home',
              click() {},
            },
            {
              id: 'insights',
              label: 'Insights',
              active: true,
              icon: 'speed',
              click() {},
            },
          ],
        },
        {
          label: 'Módulos',
          items: [
            {
              id: 'flows',
              label: 'Fluxos',
              active: false,
              icon: 'account_tree',
              click() {},
            },
            {
              id: 'studio',
              label: 'Estudio',
              active: false,
              icon: 'ad',
              click() {},
            },
            {
              id: 'ia',
              label: 'Inteligência Artificial',
              active: false,
              icon: 'neurology',
              click() {},
            },
            {
              id: 'chats',
              label: 'Chats',
              active: false,
              icon: 'forum',
              click() {},
            },
          ],
        },
        {
          label: 'Projeto',
          items: [
            {
              label: 'Aplicativos',
              active: false,
              icon: 'dashboard',
              click() {},
            },
            {
              label: 'Configurações',
              active: false,
              icon: 'settings',
              click() {},
            },
          ],
        },
      ];
    },
  },
};
</script>

<!-- Copied from weni-webapp. Temporary component, so corrections (good practices) here are not necessary -->
<style lang="scss" scoped>
$transition-time: 0.4s;

.connect-sidebar {
  min-height: 100vh;

  &.unnnic-sidebar-primary {
    padding: $unnnic-spacing-lg $unnnic-spacing-md;
  }

  &__header {
    width: $unnnic-spacing-md;
    height: $unnnic-icon-size-md;
    overflow: hidden;
    margin: 0 auto;
    transition: width $transition-time;
    cursor: pointer;

    img {
      vertical-align: middle;
      height: 18.89px;
      transition: all $transition-time;
      max-width: max-content;
    }
  }

  &.unnnic-sidebar-primary-expanded {
    .connect-sidebar__header {
      width: 85px;

      img {
        height: $unnnic-icon-size-md;
      }
    }
  }
  :deep(.unnnic-language-select) {
    z-index: 1;
  }
}
</style>
