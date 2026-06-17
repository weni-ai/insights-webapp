<template>
  <section class="dashboard-conversational">
    <Info class="dashboard-conversational__info" />

    <section
      class="dashboard-conversational__section"
      data-testid="conversations-section"
    >
      <h2 class="dashboard-conversational__section-title">
        {{ $t('conversations_dashboard.sections.conversations') }}
      </h2>
      <LazyWidget class="dashboard-conversational__header">
        <DashboardHeader />
      </LazyWidget>
    </section>

    <section
      class="dashboard-conversational__section"
      data-testid="contacts-section"
    >
      <h2 class="dashboard-conversational__section-title">
        {{ $t('conversations_dashboard.sections.contacts') }}
      </h2>
      <LazyWidget class="dashboard-conversational__header">
        <ContactsHeader />
      </LazyWidget>
    </section>

    <LazyWidget class="dashboard-conversational__most-talked-about-topics">
      <MostTalkedAboutTopicsWidget />
    </LazyWidget>

    <LazyWidget
      v-if="isAbandonedCartRecoveryConfigured"
      class="dashboard-conversational__abandoned-cart-widget"
    >
      <AbandonedCartWidget />
    </LazyWidget>

    <ConversationalDynamicWidget
      v-for="(widget, index) in orderedDynamicWidgets"
      :key="`${widget.type}-${widget.uuid || index}`"
      :type="widget.type"
      :uuid="widget.uuid"
      class="dashboard-conversational__dynamic-widget"
      :class="{
        'dashboard-conversational__dynamic-widget--only-add': isOnlyAddWidget(
          widget.type,
        ),
      }"
    />
    <CustomizableDrawer />
    <DataFeedbackModal
      v-if="isFeatureFlagEnabled('insightsDataFeedback')"
      v-model="shouldShowModal"
      :surveyUuid="surveyUuid"
      @postpone="onPostpone"
      @submitted="onSubmitted"
      @submit-error="onSubmitError"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import DashboardHeader from '@/components/insights/conversations/DashboardHeader.vue';
import ContactsHeader from '@/components/insights/conversations/ContactsHeader.vue';
import MostTalkedAboutTopicsWidget from '@/components/insights/conversations/MostTalkedAboutTopicsWidget/index.vue';
import ConversationalDynamicWidget from '@/components/insights/conversations/ConversationalDynamicWidget.vue';
import CustomizableDrawer from '@/components/insights/conversations/CustomizableWidget/CustomizableDrawer.vue';
import Info from '@/components/insights/conversations/Info.vue';
import DataFeedbackModal from '@/components/insights/conversations/Feedback/DataFeedbackModal.vue';
import AbandonedCartWidget from '@/components/insights/conversations/AbandonedCartWidget/index.vue';
import LazyWidget from '@/components/insights/Layout/LazyWidget.vue';

import { useWidgets } from '@/store/modules/widgets';
import { useCustomWidgets } from '@/store/modules/conversational/customWidgets';
import { useConversational } from '@/store/modules/conversational/conversational';
import { useConversationalWidgets } from '@/store/modules/conversational/widgets';
import { useConversationalTopics } from '@/store/modules/conversational/topics';
import { useAutoWidgets } from '@/store/modules/conversational/autoWidgets';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import { useDashboards } from '@/store/modules/dashboards';
import { useProject } from '@/store/modules/project';

import { useFeedbackSurvey } from '@/composables/useFeedbackSurvey';

const { isFeatureFlagEnabled } = useFeatureFlag();
const { activeFeatures } = storeToRefs(useFeatureFlag());

const {
  shouldShowModal,
  surveyUuid,
  checkSurvey,
  onPostpone,
  onSubmitted,
  onSubmitError,
} = useFeedbackSurvey();

type ConversationalWidgetType =
  | 'csat'
  | 'nps'
  | 'add'
  | 'sales_funnel'
  | 'custom'
  | 'crosstab'
  | 'absolute_numbers'
  | 'agent_invocation'
  | 'tool_result'
  | 'search_term'
  | 'added_to_cart';

const customWidgets = useCustomWidgets();
const widgets = useWidgets();
const conversational = useConversational();
const conversationalWidgets = useConversationalWidgets();
const topicsStore = useConversationalTopics();
const autoWidgets = useAutoWidgets();
const project = useProject();

const { isLoadingCurrentDashboardWidgets, currentDashboardWidgets } =
  storeToRefs(widgets);
const { isConfigurationLoaded } = storeToRefs(conversational);
const { isAbandonedCartRecoveryConfigured } = storeToRefs(
  conversationalWidgets,
);

const dynamicWidgets = ref<{ type: ConversationalWidgetType; uuid: string }[]>(
  [],
);

const dashboardsStore = useDashboards();
const { currentDashboard } = storeToRefs(dashboardsStore);

const orderedDynamicWidgets = computed(() => {
  if (isLoadingCurrentDashboardWidgets.value) {
    return [];
  }

  return dynamicWidgets.value;
});

const isOnlyAddWidget = (widget: ConversationalWidgetType) => {
  const isOddNumberOfWidgets = dynamicWidgets.value.length % 2 === 1;
  const isLastWidgetAdd = widget === 'add';

  return isOddNumberOfWidgets && isLastWidgetAdd;
};

const setDynamicWidgets = () => {
  const newWidgets: { type: ConversationalWidgetType; uuid: string }[] = [];
  const useMock = conversational.shouldUseMock;

  if (currentDashboard.value.config?.show_agent_invocation) {
    newWidgets.push({ type: 'agent_invocation', uuid: '' });
  }
  if (currentDashboard.value.config?.show_tool_result) {
    newWidgets.push({ type: 'tool_result', uuid: '' });
  }

  if (useMock || conversationalWidgets.isCsatConfigured) {
    newWidgets.push({ type: 'csat', uuid: '' });
  }
  if (useMock || conversationalWidgets.isNpsConfigured) {
    newWidgets.push({ type: 'nps', uuid: '' });
  }

  const customWidgetsList = customWidgets.getCustomWidgets;

  if (customWidgetsList.length > 0) {
    customWidgetsList.forEach((widget) => {
      newWidgets.push({
        type:
          (widget.type?.split('.')[1] as
            | 'custom'
            | 'crosstab'
            | 'absolute_numbers') || 'custom',
        uuid: widget.uuid,
      });
    });
  }

  if (useMock || conversationalWidgets.isSalesFunnelConfigured) {
    newWidgets.push({ type: 'sales_funnel', uuid: '' });
  }

  if (
    project.isSearchTermAgentAvailable &&
    conversationalWidgets.isSearchTermConfigured
  ) {
    newWidgets.push({ type: 'search_term', uuid: '' });
  }
  if (
    project.isAddedToCartAgentAvailable &&
    conversationalWidgets.isAddedToCartConfigured
  ) {
    newWidgets.push({ type: 'added_to_cart', uuid: '' });
  }

  newWidgets.push({ type: 'add', uuid: '' });

  const hasChanged =
    dynamicWidgets.value.length !== newWidgets.length ||
    dynamicWidgets.value.some(
      (widget, index) =>
        widget.type !== newWidgets[index]?.type ||
        widget.uuid !== newWidgets[index]?.uuid,
    );

  if (hasChanged) {
    dynamicWidgets.value = newWidgets;
  }
};

const waitForDashboardWidgets = () =>
  new Promise<void>((resolve) => {
    if (!isLoadingCurrentDashboardWidgets.value) {
      resolve();
      return;
    }
    const stop = watch(isLoadingCurrentDashboardWidgets, (loading) => {
      if (!loading) {
        stop();
        resolve();
      }
    });
  });

const initializeConfiguration = async () => {
  const topicsPromise = topicsStore.loadFormTopics();
  project.getAgentsTeam();

  await waitForDashboardWidgets();
  setDynamicWidgets();

  await topicsPromise;
  conversational.setConfigurationLoaded(true);

  if (conversational.shouldUseMock) {
    customWidgets.injectMockWidgets();
  }

  if (
    isFeatureFlagEnabled('insightsDataFeedback') &&
    !conversational.shouldUseMock
  ) {
    checkSurvey();
  }

  setDynamicWidgets();
};

watch(
  [
    () => currentDashboardWidgets.value,
    () => currentDashboard.value.config,
    () => project.agentsTeam.agents,
    () => activeFeatures.value,
  ],
  () => {
    if (isConfigurationLoaded.value) {
      setDynamicWidgets();
    }
  },
  { deep: true },
);

watch(
  () => conversational.hasEndpointErrors,
  (hasErrors) => {
    if (hasErrors && isConfigurationLoaded.value) {
      customWidgets.clearMockWidgets();
      setDynamicWidgets();
    }
  },
);

watch(
  () => conversational.hasEndpointData,
  (hasData) => {
    if (hasData && isConfigurationLoaded.value) {
      customWidgets.clearMockWidgets();
      setDynamicWidgets();
    }
  },
);

onMounted(async () => {
  initializeConfiguration();
});

watch(activeFeatures, () => {
  if (
    isFeatureFlagEnabled('insightsDataFeedback') &&
    !conversational.shouldUseMock
  ) {
    checkSurvey();
  }
});

onUnmounted(() => {
  dynamicWidgets.value = [];
  customWidgets.clearMockWidgets();
  autoWidgets.resetAutoWidgets();
  conversational.setConfigurationLoaded(false);
  conversational.setHasEndpointData(false);
});
</script>

<style lang="scss" scoped>
$layout-gap: $unnnic-space-4;

.dashboard-conversational {
  display: flex;
  gap: $layout-gap;
  flex-wrap: wrap;

  &__section {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
    width: 100%;
  }

  &__section-title {
    color: $unnnic-color-gray-12;
    font: $unnnic-font-display-2;
    font-weight: 900;
    margin: 0;
  }

  &__header {
    width: 100%;
  }

  &__abandoned-cart-widget {
    width: 100%;
  }

  &__most-talked-about-topics {
    width: 100%;
  }

  &__dynamic-widget {
    min-width: calc(50% - $layout-gap / 2);
    width: fit-content;

    &--only-add {
      min-width: 100%;
    }
  }
}
</style>
