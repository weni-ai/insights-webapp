<template>
  <form
    @submit.prevent
    @keydown.enter.prevent
  >
    <UnnnicDrawer
      ref="unnnicDrawer"
      class="drawer-config-widget-dynamic"
      wide
      :modelValue="modelValue"
      :title="drawerProps?.title"
      :description="drawerProps?.description"
      :primaryButtonText="$t('save')"
      :secondaryButtonText="$t('cancel')"
      :disabledPrimaryButton="disablePrimaryButton || isLoadingFlowOptions"
      :loadingPrimaryButton="isLoadingUpdateConfig"
      :withoutOverlay="showModalResetWidget"
      @primary-button-click="updateWidgetConfig"
      @secondary-button-click="internalClose"
      @close="configType ? $emit('back') : $emit('close')"
    >
      <template #content>
        <section class="drawer-config-widget-dynamic__content">
          <component
            :is="isLoadingFlowOptions ? content.loading : content.component"
            v-bind="contentProps"
            v-on="contentEvents"
          />
        </section>
      </template>
    </UnnnicDrawer>
    <ModalResetWidget
      v-model="showModalResetWidget"
      :widget="widget"
      @finish-reset="$emit('close')"
    />
  </form>
</template>

<script>
import { mapActions } from 'vuex';
import unnnic from '@weni/unnnic-system';
import Projects from '@/services/api/resources/projects';

import DrawerConfigContentFunnel from './DrawerConfigContentFunnel.vue';
import DrawerConfigContentCard from './DrawerConfigContentCard.vue';
import SkeletonConfigContentCard from './loadings/SkeletonConfigContentCard.vue';
import SkeletonConfigContentFunnel from './loadings/SkeletonConfigContentFunnel.vue';

import ModalResetWidget from '@/components/ModalResetWidget.vue';

export default {
  name: 'DrawerConfigWidgetDynamic',

  components: {
    DrawerConfigContentFunnel,
    DrawerConfigContentCard,
    SkeletonConfigContentCard,
    SkeletonConfigContentFunnel,
    ModalResetWidget,
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
    configType: {
      type: String,
      default: '',
    },
  },

  emits: ['close', 'back'],

  data() {
    return {
      config: {},
      flows: [],
      flowsOptions: [
        { value: '', label: this.$t('drawers.config_funnel.select_flow') },
      ],
      disablePrimaryButton: false,
      isLoadingUpdateConfig: false,
      isLoadingFlowOptions: false,
      showModalResetWidget: false,
    };
  },
  computed: {
    drawerProps() {
      const { $t } = this;
      const configMap = {
        graph_funnel: {
          default: {
            title: $t('drawers.config_funnel.title'),
            description: $t('drawers.config_funnel.description'),
          },
        },
        card: {
          default: {
            title: $t('drawers.config_card.title'),
          },
          executions: {
            title: $t(`drawers.config_gallery.options.executions.title`),
            description: $t(
              `drawers.config_gallery.options.executions.description`,
            ),
          },
          flow_result: {
            title: $t(`drawers.config_gallery.options.flow_result.title`),
            description: $t(
              `drawers.config_gallery.options.flow_result.description`,
            ),
          },
        },
      };

      return configMap[this.widget?.type][this.configType || 'default'] || {};
    },
    content() {
      const componentMap = {
        graph_funnel: {
          loading: SkeletonConfigContentFunnel,
          component: DrawerConfigContentFunnel,
        },
        card: {
          loading: SkeletonConfigContentCard,
          component: DrawerConfigContentCard,
        },
      };

      return componentMap[this.widget?.type] || {};
    },
    contentProps() {
      const { flowsOptions, widget, flows } = this;

      const defaultProps = {
        flowsOptions,
        modelValue: widget,
      };

      const mappingProps = {
        card: { flows, type: this.configType },
      };

      return { ...defaultProps, ...mappingProps[this.widget?.type] };
    },
    contentEvents() {
      const defaultEvents = {
        'update:model-value': (config) => (this.config = config),
        'update-disable-primary-button': (boolean) =>
          (this.disablePrimaryButton = boolean),
        'reset-widget': () => (this.showModalResetWidget = true),
      };

      const mappingEvents = {};

      return { ...defaultEvents, ...mappingEvents[this.widget?.type] };
    },

    treatedWidget() {
      const { widget } = this;

      const defaultConfigs = {
        ...widget,
        source: 'flowruns',
      };

      let newWidget = {};

      switch (widget.type) {
        case 'graph_funnel':
          newWidget = this.createGraphFunnelWidget;
          break;
        case 'card':
          newWidget = this.createCardWidget;
          break;
      }

      return { ...defaultConfigs, ...newWidget };
    },

    createGraphFunnelWidget() {
      let metricsObj = {};
      this.config.forEach((metric, index) => {
        metricsObj[`metric_${index + 1}`] = {
          name: metric.name,
          operation: 'count',
          filter: { flow: metric.flow?.[0].value },
        };
      });

      return {
        name: this.$t('widgets.graph_funnel.title'),
        config: metricsObj,
      };
    },

    createCardWidget() {
      const { config } = this;
      const configuredFlow = config?.flow?.[0];
      const operationRecurrenceConfigs =
        config.result?.operation === 'recurrence' ? { data_suffix: '%' } : {};
      return {
        name: config.name,
        report_name: `${this.$t('drawers.config_card.total_flow_executions')} ${configuredFlow?.label}`,
        config: {
          operation:
            this.configType === 'executions'
              ? 'count'
              : config.result?.operation,
          filter: { flow: configuredFlow?.value },
          currency: config.currency,
          op_field: config.result?.name[0]?.value,
          ...operationRecurrenceConfigs,
        },
      };
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
      getCurrentDashboardWidgetData: 'dashboards/getCurrentDashboardWidgetData',
      getWidgetGraphFunnelData: 'dashboards/getWidgetGraphFunnelData',
    }),

    fetchFlowsSource() {
      this.isLoadingFlowOptions = true;
      Projects.getProjectSource('flows')
        .then((response) => {
          this.flows = response;
          this.flows?.forEach((source) => {
            this.flowsOptions.push({ value: source.uuid, label: source.name });
          });
        })
        .finally(() => {
          this.isLoadingFlowOptions = false;
        });
    },

    internalClose() {
      this.$refs.unnnicDrawer.close();
    },

    async updateWidgetConfig() {
      this.isLoadingUpdateConfig = true;

      try {
        await this.updateWidget(this.treatedWidget);

        if (this.widget.type === 'graph_funnel') {
          await this.getWidgetGraphFunnelData({
            uuid: this.widget.uuid,
            widgetFunnelConfig: this.treatedWidget.config,
          });
        } else {
          await this.getCurrentDashboardWidgetData(this.widget.uuid);
        }

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
      } finally {
        this.$emit('close');
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
