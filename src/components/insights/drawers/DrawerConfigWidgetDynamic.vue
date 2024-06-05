<template>
  <UnnnicDrawer
    ref="unnnicDrawer"
    class="drawer-config-widget-dynamic"
    :modelValue="modelValue"
    :title="drawerProps?.title"
    :description="drawerProps?.description"
    primaryButtonText="Salvar"
    secondaryButtonText="Cancelar"
    :disabledPrimaryButton="disablePrimaryButton"
    :loadingPrimaryButton="isLoadingUpdateConfig"
    @primary-button-click="updateWidgetConfig"
    @secondary-button-click="internalClose"
    @close="$emit('close')"
  >
    <template #content>
      <form
        class="drawer-config-widget-dynamic__content"
        @submit.prevent
      >
        <component
          :is="content"
          v-bind="contentProps"
          v-on="contentEvents"
        />
      </form>
    </template>
  </UnnnicDrawer>
</template>

<script>
import { mapActions } from 'vuex';
import unnnic from '@weni/unnnic-system';
import Projects from '@/services/api/resources/projects';

import DrawerConfigContentFunnel from './DrawerConfigContentFunnel.vue';

export default {
  name: 'DrawerConfigWidgetDynamic',

  emits: ['close'],

  components: {
    DrawerConfigContentFunnel,
  },

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    widget: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      config: {},
      flowsOptions: [{ value: '', label: 'Selecionar fluxo' }],

      disablePrimaryButton: false,
      isLoadingUpdateConfig: false,
    };
  },

  created() {
    this.fetchFlowsSource();
  },

  computed: {
    drawerProps() {
      const configMap = {
        graph_funnel: {
          title: 'Definir métricas do gráfico',
          description:
            'Selecione pelo menos três fluxos para obter a visualização em gráfico de funil',
        },
        card: {
          title: 'Definir métrica para o card',
        },
      };

      return configMap[this.widget?.type] || {};
    },
    content() {
      const componentMap = {
        graph_funnel: DrawerConfigContentFunnel,
        card: null,
      };

      return componentMap[this.widget?.type] || {};
    },
    contentProps() {
      const { flowsOptions, config } = this;

      const defaultProps = {
        flowsOptions,
        modelValue: config,
      };

      const mappingProps = {};

      return { ...defaultProps, ...mappingProps[this.widget?.type] };
    },
    contentEvents() {
      const mappingEvents = {
        graph_funnel: {
          updateDisablePrimaryButton: (boolean) =>
            (this.disablePrimaryButton = boolean),
        },
        card: {},
      };

      return mappingEvents[this.widget?.type] || {};
    },
  },

  methods: {
    ...mapActions({
      updateWidget: 'dashboards/updateWidget',
    }),

    async fetchFlowsSource() {
      const response = await Projects.getProjectSource('flows');
      response?.forEach((source) => {
        this.flowsOptions.push({ value: source.uuid, label: source.name });
      });
    },

    internalClose() {
      this.$refs.unnnicDrawer.close();
    },

    async updateWidgetConfig() {
      const { config } = this;
      this.isLoadingUpdateConfig = true;

      const newWidget = { ...this.widget };
      newWidget.config = config;

      try {
        await this.updateWidget(newWidget);

        unnnic.unnnicCallAlert({
          props: {
            text: `Métrica salva com sucesso`,
            type: 'success',
          },
          seconds: 5,
        });
      } catch (error) {
        unnnic.unnnicCallAlert({
          props: {
            text: `Erro ao salvar, tente novamente`,
            type: 'error',
          },
          seconds: 5,
        });
      }

      this.isLoadingUpdateConfig = false;
    },
  },

  watch: {
    isLoadingUpdateConfig(newIsLoadingUpdateConfig) {
      if (!newIsLoadingUpdateConfig) {
        this.internalClose();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.drawer-config-widget-dynamic {
  &__content {
    display: grid;
    gap: $unnnic-spacing-sm;
  }
}
</style>
