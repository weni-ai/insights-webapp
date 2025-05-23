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
import { mapActions, mapState } from 'pinia';

import { useProject } from '@/store/modules/project';
import { useWidgets } from '@/store/modules/widgets';
import { useOnboarding } from '@/store/modules/onboarding';

import DrawerConfigContentVtexConversions from './DrawerConfigContentVtexConversions.vue';
import SkeletonConfigContentVtexConversions from './loadings/SkeletonConfigContentVtexConversions.vue';
import DrawerConfigContentFunnel from './DrawerConfigContentFunnel.vue';
import DrawerConfigContentCard from './DrawerConfigContentCard.vue';
import SkeletonConfigContentCard from './loadings/SkeletonConfigContentCard.vue';
import SkeletonConfigContentFunnel from './loadings/SkeletonConfigContentFunnel.vue';
import SkeletonConfigContentVtex from './loadings/SkeletonConfigContentVtex.vue';
import DrawerConfigContentVtex from './DrawerConfigContentVtex.vue';
import SkeletonConfigContentRecurrence from './loadings/SkeletonConfigContentRecurrence.vue';
import DrawerConfigContentRecurrence from './DrawerConfigContentRecurrence.vue';
import ModalResetWidget from '@/components/ModalResetWidget.vue';

import unnnic from '@weni/unnnic-system';

export default {
  name: 'DrawerConfigWidgetDynamic',

  components: {
    DrawerConfigContentVtexConversions,
    SkeletonConfigContentVtexConversions,
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
    ...mapState(useProject, {
      isLoadingProjectFlows: 'isLoadingFlows',
      projectFlows: 'flows',
    }),
    ...mapState(useWidgets, { widget: 'currentWidgetEditing' }),
    ...mapState(useOnboarding, [
      'onboardingRefs',
      'showConfigWidgetOnboarding',
    ]),
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
          vtex_conversions: {
            title: $t(`drawers.config_gallery.options.vtex_conversions.title`),
            description: $t(
              `drawers.config_gallery.options.vtex_conversions.description`,
            ),
          },
          recurrence: {
            title: $t(`drawers.config_gallery.options.recurrence.title`),
            description: $t(
              `drawers.config_gallery.options.recurrence.description`,
            ),
          },
        },
        recurrence: {
          title: $t(`drawers.config_gallery.options.recurrence.title`),
          description: $t(
            `drawers.config_gallery.options.recurrence.description`,
          ),
        },
        vtex_order: {
          vtex: {
            title: $t(`drawers.config_gallery.options.vtex.title`),
            description: $t(`drawers.config_gallery.options.vtex.description`),
          },
        },
        vtex_conversions: {
          default: {
            title: $t(`drawers.config_gallery.options.vtex_conversions.title`),
            description: $t(
              `drawers.config_gallery.options.vtex_conversions.description`,
            ),
          },
        },
      };

      return configMap[this.widget?.type][this.configType || 'default'] || {};
    },

    content() {
      const currentType = [
        'vtex',
        'vtex_conversions',
        'funnel',
        'recurrence',
      ].includes(this.configType)
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
        vtex_conversions: {
          loading: SkeletonConfigContentVtexConversions,
          component: DrawerConfigContentVtexConversions,
        },
        recurrence: {
          loading: SkeletonConfigContentRecurrence,
          component: DrawerConfigContentRecurrence,
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
          if (this.configType === 'recurrence')
            newWidget = this.createRecurrenceWidget;
          if (this.configType === 'vtex') newWidget = this.createVtexWidget;
          if (this.configType === 'funnel')
            newWidget = this.createGraphFunnelWidget;
          if (this.configType === 'vtex_conversions')
            newWidget = this.createVtexConversionsWidget;
          break;
        case 'recurrence':
          newWidget = this.createRecurrenceWidget;
          break;
        case 'vtex_order':
          newWidget = this.createVtexWidget;
          break;
        case 'vtex_conversions': {
          newWidget = this.createVtexConversionsWidget;
          break;
        }
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
        type: 'graph_funnel',
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

    createVtexConversionsWidget() {
      const { config, name } = this.config;

      return {
        name,
        source: 'vtex_conversions',
        type: 'vtex_conversions',
        config,
      };
    },

    createRecurrenceWidget() {
      const { widget } = this;
      const selectedFlowLabel = this.projectFlows.find(
        (flow) => flow.value === widget.config?.flow?.uuid,
      )?.label;

      return {
        name: widget.config?.name,
        report_name: `${this.$t('drawers.config_card.total_flow_executions')} ${selectedFlowLabel}`,
        config: {
          filter: { flow: widget.config.flow.uuid },
          ...widget.config,
          operation: 'recurrence',
          type: 'flow_result',
          op_field: widget.config.flow.result,
          limit: 5,
        },
        report: {
          type: 'internal',
        },
        type: 'recurrence',
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
    ...mapActions(useWidgets, [
      'updateWidget',
      'getCurrentDashboardWidgetData',
      'getWidgetGraphFunnelData',
      'getWidgetRecurrenceData',
      'getWidgetVtexOrderData',
    ]),
    ...mapActions(useOnboarding, [
      'callTourNextStep',
      'callTourPreviousStep',
      'setShowCompleteOnboardingModal',
    ]),

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

        const isRecurrence =
          this.widget.type === 'recurrence' || this.configType === 'recurrence';

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
        } else if (isRecurrence) {
          await this.getWidgetRecurrenceData({
            uuid: this.widget.uuid,
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
