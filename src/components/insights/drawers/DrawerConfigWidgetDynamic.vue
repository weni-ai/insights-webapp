<template>
  <UnnnicDrawer
    ref="unnnicDrawer"
    class="drawer-config-widget-dynamic"
    wide
    distinctCloseBack
    :data-onboarding-id="
      widget.type === 'card'
        ? 'drawer-card-metric-config'
        : 'drawer-graph-empty'
    "
    size="md"
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
    @close="$emit('close')"
    @back="configType ? $emit('back') : $emit('close')"
  >
    <template #content>
      <form
        class="drawer-config-widget-dynamic__form-container"
        @submit.prevent
        @keydown.enter.prevent
      >
        <section class="drawer-config-widget-dynamic__content">
          <component
            :is="isLoadingProjectFlows ? content.loading : content.component"
            v-if="widget"
            v-bind="contentProps"
            v-on="contentEvents"
          />
        </section>
      </form>
    </template>
  </UnnnicDrawer>
  <ModalResetWidget
    v-model="showModalResetWidget"
    :widget="widget"
    @finish-reset="$emit('close', { handleTourNextStep: false })"
  />
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import unnnic from '@weni/unnnic-system';

import DrawerConfigContentFunnel from './DrawerConfigContentFunnel.vue';
import DrawerConfigContentCard from './DrawerConfigContentCard.vue';
import SkeletonConfigContentCard from './loadings/SkeletonConfigContentCard.vue';
import SkeletonConfigContentFunnel from './loadings/SkeletonConfigContentFunnel.vue';
import SkeletonConfigContentVtex from './loadings/SkeletonConfigContentVtex.vue';
import DrawerConfigContentVtex from './DrawerConfigContentVtex.vue';

import ModalResetWidget from '@/components/ModalResetWidget.vue';

export default {
  name: 'DrawerConfigWidgetDynamic',

  components: {
    DrawerConfigContentFunnel,
    DrawerConfigContentCard,
    SkeletonConfigContentCard,
    SkeletonConfigContentFunnel,
    DrawerConfigContentVtex,
    SkeletonConfigContentVtex,
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
      onboardingRefs: (state) => state.onboarding.onboardingRefs,
      showConfigWidgetOnboarding: (state) =>
        state.onboarding.showConfigWidgetOnboarding,
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
        empty_column: {
          default: {
            title: $t('drawers.config_card.title'),
          },
          funnel: {
            title: $t('drawers.config_funnel.title'),
            description: $t('drawers.config_funnel.description'),
          },
          vtex: {
            title: $t(`drawers.config_gallery.options.vtex.title`),
            description: $t(`drawers.config_gallery.options.vtex.description`),
          },
        },
        vtex_order: {
          vtex: {
            title: $t(`drawers.config_gallery.options.vtex.title`),
            description: $t(`drawers.config_gallery.options.vtex.description`),
          },
        },
      };

      return configMap[this.widget?.type][this.configType || 'default'] || {};
    },
    content() {
      const currentType = ['vtex', 'funnel'].includes(this.configType)
        ? this.configType
        : this.widget?.type;

      const componentMap = {
        graph_funnel: {
          loading: SkeletonConfigContentFunnel,
          component: DrawerConfigContentFunnel,
        },
        card: {
          loading: SkeletonConfigContentCard,
          component: DrawerConfigContentCard,
        },
        funnel: {
          loading: SkeletonConfigContentFunnel,
          component: DrawerConfigContentFunnel,
        },
        vtex: {
          loading: SkeletonConfigContentVtex,
          component: DrawerConfigContentVtex,
        },
      };

      return componentMap[currentType] || {};
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
        case 'empty_column':
          if (this.configType === 'funnel')
            newWidget = this.createGraphFunnelWidget;
          else newWidget = this.createVtexWidget;
          break;
        case 'vtex_order':
          newWidget = this.createVtexWidget;
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
        (flow) => flow.value === widget.config?.flow?.uuid,
      )?.label;
      const hasReportName =
        this.configType === 'flow_result' &&
        widget.config?.operation === 'recurrence';

      return {
        name: widget.config?.name,
        ...(hasReportName
          ? {
              report_name: `${this.$t('drawers.config_card.total_flow_executions')} ${selectedFlowLabel}`,
            }
          : {}),
        config: widget.config,
      };
    },

    createVtexWidget() {
      const { config } = this.config;

      return {
        name: 'vtex_orders',
        source: 'orders',
        type: 'vtex_order',
        config,
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
      getWidgetVtexOrderData: 'widgets/getWidgetVtexOrderData',
      callTourNextStep: 'onboarding/callTourNextStep',
      callTourPreviousStep: 'onboarding/callTourPreviousStep',
    }),

    ...mapMutations({
      setShowCompleteOnboardingModal:
        'onboarding/SET_SHOW_COMPLETE_ONBOARDING_MODAL',
    }),

    internalClose() {
      this.$refs.unnnicDrawer.close();

      this.callTourPreviousStep({
        tour: 'widgets-onboarding-tour',
        qtdSteps: ['card', 'empty_column'].includes(this.widget.type) ? 2 : 1,
        timeout: 300,
      });
    },

    async updateWidgetConfig() {
      this.isLoadingUpdateConfig = true;

      try {
        await this.updateWidget(this.treatedWidget);

        const isFunnel =
          this.widget.type === 'graph_funnel' || this.configType === 'funnel';

        if (isFunnel) {
          await this.getWidgetGraphFunnelData({
            uuid: this.widget.uuid,
            widgetFunnelConfig: this.treatedWidget.config,
          });
        } else if (this.configType === 'vtex') {
          await this.getWidgetVtexOrderData({
            uuid: this.widget.uuid,
            utm_source: this.treatedWidget.config.filter.utm,
          });
        } else {
          await this.getCurrentDashboardWidgetData(this.treatedWidget);
        }

        if (this.showConfigWidgetOnboarding) {
          const isLastTourStep =
            this.onboardingRefs['widgets-onboarding-tour'].currentStep ===
            this.onboardingRefs['widgets-onboarding-tour'].steps.length;
          if (isLastTourStep) {
            this.callTourNextStep('widgets-onboarding-tour');
            this.setShowCompleteOnboardingModal(true);
            localStorage.setItem('hasWidgetsOnboardingComplete', true);
          }
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
        this.$emit('close', { handleTourNextStep: true });
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
