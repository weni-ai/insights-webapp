<template>
  <form
    class="drawer-config-widget-dynamic__form-container"
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
      :disabledPrimaryButton="disablePrimaryButton || isLoadingProjectFlows"
      :loadingPrimaryButton="isLoadingUpdateConfig"
      :withoutOverlay="showModalResetWidget"
      @primary-button-click="updateWidgetConfig"
      @secondary-button-click="internalClose"
      @close="configType ? $emit('back') : $emit('close')"
    >
      <template #content>
        <section class="drawer-config-widget-dynamic__content">
          <component
            :is="isLoadingProjectFlows ? content.loading : content.component"
            v-if="widget"
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
import { mapActions, mapState } from 'vuex';
import unnnic from '@weni/unnnic-system';

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
    configType: {
      type: String,
      default: '',
    },
  },

  emits: ['close', 'back'],

  data() {
    return {
      config: {},
      disablePrimaryButton: false,
      isLoadingUpdateConfig: false,
      showModalResetWidget: false,
    };
  },
  computed: {
    ...mapState({
      isLoadingProjectFlows: (state) => state.project.isLoadingFlows,
      projectFlows: (state) => state.project.flows,
      widget: (state) => state.widgets.currentWidgetEditing,
    }),

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
          data_crossing: {
            title: $t(`drawers.config_gallery.options.data_crossing.title`),
            description: $t(
              `drawers.config_gallery.options.data_crossing.description`,
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
      const { widget } = this;

      const defaultProps = {
        modelValue: widget,
      };

      const mappingProps = {
        card: { type: this.configType },
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
          filter: { flow: metric.flow },
        };
      });

      return {
        name: this.$t('widgets.graph_funnel.title'),
        config: metricsObj,
      };
    },

    createCardWidget() {
      const { widget } = this;
      const selectedFlowLabel = this.projectFlows.find(
        (flow) => flow.value === widget.config.flow.uuid,
      )?.label;
      const hasReportName =
        this.configType === 'flow_result' &&
        widget.config.operation === 'recurrence';

      return {
        name: widget.config.name,
        ...(hasReportName
          ? {
              report_name: `${this.$t('drawers.config_card.total_flow_executions')} ${selectedFlowLabel}`,
            }
          : {}),
        config: widget.config,
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

  methods: {
    ...mapActions({
      updateWidget: 'widgets/updateWidget',
      getCurrentDashboardWidgetData: 'widgets/getCurrentDashboardWidgetData',
      getWidgetGraphFunnelData: 'widgets/getWidgetGraphFunnelData',
    }),

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
          await this.getCurrentDashboardWidgetData(this.treatedWidget);
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
  &__form-container {
    position: absolute;
  }

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
