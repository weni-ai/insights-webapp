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
    :primaryButtonText="t('save')"
    :secondaryButtonText="t('cancel')"
    :disabledPrimaryButton="disablePrimaryButton || isLoadingProjectFlows"
    :loadingPrimaryButton="isLoadingUpdateConfig"
    :withoutOverlay="showModalResetWidget"
    @primary-button-click="updateWidgetConfig"
    @secondary-button-click="$emit('back')"
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

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
import { moduleStorage } from '@/utils/storage';

defineOptions({ name: 'DrawerConfigWidgetDynamic' });

const props = defineProps<{
  modelValue?: boolean;
  configType?: string;
}>();

const emit = defineEmits<{
  (e: 'close', payload?: { handleTourNextStep: boolean }): void;
  (e: 'back'): void;
}>();

const { t } = useI18n();

const projectStore = useProject();
const widgetsStore = useWidgets();
const onboardingStore = useOnboarding();

const { isLoadingFlows: isLoadingProjectFlows, flows: projectFlows } =
  storeToRefs(projectStore);
const { currentWidgetEditing: widget } = storeToRefs(widgetsStore);
const { onboardingRefs, showConfigWidgetOnboarding } =
  storeToRefs(onboardingStore);

const config = ref<any>({});
const disablePrimaryButton = ref(false);
const isLoadingUpdateConfig = ref(false);
const showModalResetWidget = ref(false);

const drawerProps = computed(() => {
  const configMap: Record<string, any> = {
    graph_funnel: {
      default: {
        title: t('drawers.config_funnel.title'),
        description: t('drawers.config_funnel.description'),
      },
    },
    card: {
      default: {
        title: t('drawers.config_card.title'),
      },
      executions: {
        title: t('drawers.config_gallery.options.executions.title'),
        description: t('drawers.config_gallery.options.executions.description'),
      },
      flow_result: {
        title: t('drawers.config_gallery.options.flow_result.title'),
        description: t(
          'drawers.config_gallery.options.flow_result.description',
        ),
      },
      data_crossing: {
        title: t('drawers.config_gallery.options.data_crossing.title'),
        description: t(
          'drawers.config_gallery.options.data_crossing.description',
        ),
      },
    },
    empty_column: {
      default: {
        title: t('drawers.config_card.title'),
      },
      funnel: {
        title: t('drawers.config_funnel.title'),
        description: t('drawers.config_funnel.description'),
      },
      vtex: {
        title: t('drawers.config_gallery.options.vtex.title'),
        description: t('drawers.config_gallery.options.vtex.description'),
      },
      vtex_conversions: {
        title: t('drawers.config_gallery.options.vtex_conversions.title'),
        description: t(
          'drawers.config_gallery.options.vtex_conversions.description',
        ),
      },
      recurrence: {
        title: t('drawers.config_gallery.options.recurrence.title'),
        description: t('drawers.config_gallery.options.recurrence.description'),
      },
    },
    recurrence: {
      title: t('drawers.config_gallery.options.recurrence.title'),
      description: t('drawers.config_gallery.options.recurrence.description'),
    },
    vtex_order: {
      vtex: {
        title: t('drawers.config_gallery.options.vtex.title'),
        description: t('drawers.config_gallery.options.vtex.description'),
      },
    },
    vtex_conversions: {
      default: {
        title: t('drawers.config_gallery.options.vtex_conversions.title'),
        description: t(
          'drawers.config_gallery.options.vtex_conversions.description',
        ),
      },
    },
  };

  return configMap[widget.value?.type]?.[props.configType || 'default'] || {};
});

const content = computed(() => {
  const currentType = [
    'vtex',
    'vtex_conversions',
    'funnel',
    'recurrence',
  ].includes(props.configType || '')
    ? props.configType
    : widget.value?.type;

  const componentMap: Record<string, any> = {
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

  return componentMap[currentType as string] || {};
});

const contentProps = computed(() => {
  const defaultProps: Record<string, any> = {
    modelValue: widget.value,
  };

  const mappingProps: Record<string, any> = {
    card: { type: props.configType },
  };

  return { ...defaultProps, ...mappingProps[widget.value?.type] };
});

const contentEvents = computed(() => {
  const defaultEvents: Record<string, any> = {
    'update:model-value': (cfg: any) => (config.value = cfg),
    'update-disable-primary-button': (val: boolean) =>
      (disablePrimaryButton.value = val),
    'reset-widget': () => (showModalResetWidget.value = true),
  };

  const mappingEvents: Record<string, any> = {};

  return { ...defaultEvents, ...mappingEvents[widget.value?.type] };
});

const createGraphFunnelWidget = computed(() => {
  const metricsObj: Record<string, any> = {};
  (config.value as any[]).forEach((metric: any, index: number) => {
    metricsObj[`metric_${index + 1}`] = {
      name: metric.name,
      operation: 'count',
      filter: { flow: metric.flow },
    };
  });

  return {
    name: t('widgets.graph_funnel.title'),
    config: metricsObj,
    type: 'graph_funnel',
  };
});

const createCardWidget = computed(() => {
  const w = widget.value;
  const selectedFlowLabel = projectFlows.value.find(
    (flow: any) => flow.value === w.config?.flow?.uuid,
  )?.label;
  const hasReportName =
    props.configType === 'flow_result' && w.config?.operation === 'recurrence';

  return {
    name: w.config?.name,
    ...(hasReportName
      ? {
          report_name: `${t('drawers.config_card.total_flow_executions')} ${selectedFlowLabel}`,
        }
      : {}),
    config: w.config,
  };
});

const createVtexWidget = computed(() => {
  const { config: cfg, name } = config.value as any;

  return {
    name,
    source: 'orders',
    type: 'vtex_order',
    config: cfg,
  };
});

const createVtexConversionsWidget = computed(() => {
  const { config: cfg, name } = config.value as any;

  return {
    name,
    source: 'vtex_conversions',
    type: 'vtex_conversions',
    config: cfg,
  };
});

const createRecurrenceWidget = computed(() => {
  const w = widget.value;
  const selectedFlowLabel = projectFlows.value.find(
    (flow: any) => flow.value === w.config?.flow?.uuid,
  )?.label;

  return {
    name: w.config?.name,
    report_name: `${t('drawers.config_card.total_flow_executions')} ${selectedFlowLabel}`,
    config: {
      filter: { flow: w.config.flow.uuid },
      ...w.config,
      operation: 'recurrence',
      type: 'flow_result',
      op_field: w.config.flow.result,
      limit: 5,
    },
    report: {
      type: 'internal',
    },
    type: 'recurrence',
  };
});

const treatedWidget = computed(() => {
  const w = widget.value;

  const defaultConfigs = {
    ...w,
    source: 'flowruns',
  };

  let newWidget: any = {};

  switch (w.type) {
    case 'graph_funnel':
      newWidget = createGraphFunnelWidget.value;
      break;
    case 'card':
      newWidget = createCardWidget.value;
      break;
    case 'empty_column':
      if (props.configType === 'recurrence')
        newWidget = createRecurrenceWidget.value;
      if (props.configType === 'vtex') newWidget = createVtexWidget.value;
      if (props.configType === 'funnel')
        newWidget = createGraphFunnelWidget.value;
      if (props.configType === 'vtex_conversions')
        newWidget = createVtexConversionsWidget.value;
      break;
    case 'recurrence':
      newWidget = createRecurrenceWidget.value;
      break;
    case 'vtex_order':
      newWidget = createVtexWidget.value;
      break;
    case 'vtex_conversions': {
      newWidget = createVtexConversionsWidget.value;
      break;
    }
  }

  return { ...defaultConfigs, ...newWidget };
});

function internalClose() {
  onboardingStore.callTourPreviousStep({
    tour: 'widgets-onboarding-tour',
    qtdSteps: ['card', 'empty_column'].includes(widget.value.type) ? 2 : 1,
    timeout: 300,
  });
}

async function updateWidgetConfig() {
  isLoadingUpdateConfig.value = true;

  try {
    await widgetsStore.updateWidget(treatedWidget.value);

    const isFunnel =
      widget.value.type === 'graph_funnel' || props.configType === 'funnel';

    const isRecurrence =
      widget.value.type === 'recurrence' || props.configType === 'recurrence';

    if (isFunnel) {
      await widgetsStore.getWidgetGraphFunnelData({
        uuid: widget.value.uuid,
        widgetFunnelConfig: treatedWidget.value.config,
      });
    } else if (props.configType === 'vtex') {
      await widgetsStore.getWidgetVtexOrderData({
        uuid: widget.value.uuid,
        utm_source: treatedWidget.value.config.filter.utm,
      });
    } else if (isRecurrence) {
      await widgetsStore.getWidgetRecurrenceData({
        uuid: widget.value.uuid,
      });
    } else {
      await widgetsStore.getCurrentDashboardWidgetData(treatedWidget.value);
    }

    if (showConfigWidgetOnboarding.value) {
      const isLastTourStep =
        onboardingRefs.value['widgets-onboarding-tour'].currentStep ===
        onboardingRefs.value['widgets-onboarding-tour'].steps.length;
      if (isLastTourStep) {
        onboardingStore.callTourNextStep('widgets-onboarding-tour');
        onboardingStore.setShowCompleteOnboardingModal(true);
        moduleStorage.setItem('hasWidgetsOnboardingComplete', true);
      }
    }
    unnnic.unnnicCallAlert({
      props: {
        text: t('drawers.metric_saved'),
        type: 'success',
      },
      seconds: 5,
    });
  } catch (error) {
    unnnic.unnnicCallAlert({
      props: {
        text: t('save_error'),
        type: 'error',
      },
      seconds: 5,
    });
  } finally {
    emit('close', { handleTourNextStep: true });
  }

  isLoadingUpdateConfig.value = false;
}

watch(isLoadingUpdateConfig, (newVal) => {
  if (!newVal) {
    internalClose();
  }
});

defineExpose({
  config,
  disablePrimaryButton,
  isLoadingUpdateConfig,
  showModalResetWidget,
  drawerProps,
  content,
  contentProps,
  contentEvents,
  treatedWidget,
  createGraphFunnelWidget,
  createCardWidget,
  createVtexWidget,
  createVtexConversionsWidget,
  createRecurrenceWidget,
  internalClose,
  updateWidgetConfig,
});
</script>

<style lang="scss" scoped>
.drawer-config-widget-dynamic {
  &__content {
    display: grid;
    gap: $unnnic-space-4;
  }

  :deep(.unnnic-label__label),
  :deep(.unnnic-form__label) {
    margin: 0 0 $unnnic-space-1;
  }
}
</style>
