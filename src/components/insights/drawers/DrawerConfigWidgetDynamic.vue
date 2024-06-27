<template>
  <UnnnicDrawer
    ref="unnnicDrawer"
    class="drawer-config-widget-dynamic"
    :modelValue="modelValue"
    :title="drawerProps?.title"
    :description="drawerProps?.description"
    :primaryButtonText="$t('save')"
    :secondaryButtonText="$t('cancel')"
    :disabledPrimaryButton="disablePrimaryButton"
    :loadingPrimaryButton="isLoadingUpdateConfig"
    @primary-button-click="updateWidgetConfig"
    @secondary-button-click="internalClose"
    @close="$emit('close')"
  >
    <template #content>
      <form
        v-if="flowsOptions.length > 1"
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
import DrawerConfigContentCard from './DrawerConfigContentCard.vue';

export default {
  name: 'DrawerConfigWidgetDynamic',

  components: {
    DrawerConfigContentFunnel,
    DrawerConfigContentCard,
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

  emits: ['close'],

  data() {
    return {
      config: {},
      flowsOptions: [
        { value: '', label: this.$t('drawers.config_funnel.select_flow') },
      ],

      disablePrimaryButton: false,
      isLoadingUpdateConfig: false,
    };
  },
  computed: {
    drawerProps() {
      const configMap = {
        graph_funnel: {
          title: this.$t('drawers.config_funnel.title'),
          description: this.$t('drawers.config_funnel.description'),
        },
        card: {
          title: this.$t('drawers.config_card.title'),
        },
      };

      return configMap[this.widget?.type] || {};
    },
    content() {
      const componentMap = {
        graph_funnel: DrawerConfigContentFunnel,
        card: DrawerConfigContentCard,
      };

      return componentMap[this.widget?.type] || {};
    },
    contentProps() {
      const { flowsOptions, widget } = this;

      const defaultProps = {
        flowsOptions,
        modelValue: widget,
      };

      const mappingProps = {};

      return { ...defaultProps, ...mappingProps[this.widget?.type] };
    },
    contentEvents() {
      const defaultEvents = {
        'update:model-value': (config) => (this.config = config),
        updateDisablePrimaryButton: (boolean) =>
          (this.disablePrimaryButton = boolean),
      };

      const mappingEvents = {};

      return { ...defaultEvents, ...mappingEvents[this.widget?.type] };
    },
  },

  watch: {
    isLoadingUpdateConfig(newIsLoadingUpdateConfig) {
      if (!newIsLoadingUpdateConfig) {
        this.internalClose();
      }
    },
  },

  async created() {
    await this.fetchFlowsSource();
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
            text: this.$t('drawers.metric_saved'),
            type: 'success',
          },
          seconds: 5,
        });
      } catch (error) {
        unnnic.unnnicCallAlert({
          props: {
            text: this.$t('save_error'),
            type: 'error',
          },
          seconds: 5,
        });
      }

      this.isLoadingUpdateConfig = false;
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

  :deep(.unnnic-label__label),
  :deep(.unnnic-form__label) {
    margin: 0 0 $unnnic-spacing-nano;
  }
}
</style>
