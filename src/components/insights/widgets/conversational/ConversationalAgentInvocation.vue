<template>
  <BaseConversationWidget
    :title="$t('conversations_dashboard.agent_invocation')"
    :isLoading="isLoading && !hasData"
    hiddenTabs
    :actions="widgetActions"
  >
    <UnnnicDisclaimer
      v-if="hasError"
      :description="$t('conversations_dashboard.auto_widget_error')"
      type="error"
    />

    <template v-else-if="!isLoading">
      <UnnnicDisclaimer
        v-if="!hasData"
        :description="$t('conversations_dashboard.auto_widget_no_data')"
        type="neutral"
      />

      <ProgressTable
        v-else
        :progressItems="progressItems"
      />
    </template>

    <section
      v-if="isLoading && hasData"
      class="auto-widget__skeleton-container"
    >
      <UnnnicSkeletonLoading
        v-for="index in 5"
        :key="index"
        width="100%"
        height="56px"
      />
    </section>

    <section
      v-if="!hasError && !isLoading"
      class="auto-widget__footer"
    >
      <p class="auto-widget__footer-count">
        {{
          $t('conversations_dashboard.agent_invocation_count', {
            count: totalCount,
          })
        }}
      </p>
      <UnnnicButton
        v-if="isExpanded"
        :text="$t('see_all')"
        type="tertiary"
        @click.stop="isSeeAllDrawerOpen = true"
      />
    </section>
  </BaseConversationWidget>

  <SeeAllDrawer
    v-if="isSeeAllDrawerOpen"
    v-model="isSeeAllDrawerOpen"
    :title="$t('conversations_dashboard.agent_invocation')"
    :data="resolvedResults"
    :color="colorBgPinkStrong"
    :backgroundColor="colorBgPinkPlain"
  />
  <ModalRemoveWidget
    v-if="isRemoveWidgetModalOpen"
    v-model="isRemoveWidgetModalOpen"
    type="agent_invocation"
    :name="$t('conversations_dashboard.agent_invocation')"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { UnnnicDisclaimer } from '@weni/unnnic-system';

import BaseConversationWidget from '@/components/insights/conversations/BaseConversationWidget.vue';
import ProgressTable from '@/components/ProgressTable.vue';
import SeeAllDrawer from '@/components/insights/conversations/CustomizableWidget/SeeAllDrawer.vue';
import ModalRemoveWidget from '@/components/insights/conversations/CustomizableWidget/ModalRemoveWidget.vue';

import { useAutoWidgets } from '@/store/modules/conversational/autoWidgets';
import { useConversational } from '@/store/modules/conversational/conversational';
import { useProject } from '@/store/modules/project';
import { useDashboards } from '@/store/modules/dashboards';

import { formatPercentage, formatNumber } from '@/utils/numbers';
import {
  colorBgPinkStrong,
  colorBgPinkPlain,
} from '@weni/unnnic-system/tokens/colors';
import i18n from '@/utils/plugins/i18n';

const route = useRoute();
const conversational = useConversational();
const autoWidgetsStore = useAutoWidgets();
const projectStore = useProject();
const dashboardsStore = useDashboards();

const { shouldUseMock } = storeToRefs(conversational);
const { currentDashboard } = storeToRefs(dashboardsStore);

const isSeeAllDrawerOpen = ref(false);
const isRemoveWidgetModalOpen = ref(false);

const isLoading = computed(() => autoWidgetsStore.agentInvocation.isLoading);
const hasData = computed(() => autoWidgetsStore.hasAgentInvocationData);
const hasError = computed(() => autoWidgetsStore.agentInvocation.error);

const results = computed(
  () => autoWidgetsStore.agentInvocation.data?.results ?? [],
);

const totalCount = computed(
  () => autoWidgetsStore.agentInvocation.data?.total ?? results.value.length,
);

const isExpanded = computed(() => results.value.length > 5);

function resolveAgentName(agentUuid: string, fallbackLabel: string): string {
  const agent = projectStore.agentsTeam.agents.find(
    (a: { uuid: string }) => a.uuid === agentUuid,
  );
  return agent?.name || fallbackLabel;
}

const resolvedResults = computed(() => {
  return results.value.map((result) => ({
    ...result,
    label: resolveAgentName(result?.agent?.uuid, result?.label),
  }));
});

const progressItems = computed(() => {
  return [...resolvedResults.value]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((result) => ({
      label: result.label,
      description: `${formatPercentage(result.value)} (${formatNumber(result.full_value)})`,
      value: result.value,
      color: colorBgPinkStrong,
      backgroundColor: colorBgPinkPlain,
    }));
});

const widgetActions = computed(() => {
  if (!currentDashboard.value?.is_editable) {
    return [];
  }
  const deleteOption = {
    icon: 'delete',
    text: i18n.global.t(
      'conversations_dashboard.customize_your_dashboard.remove_widget',
    ),
    onClick: () => (isRemoveWidgetModalOpen.value = true),
    scheme: 'aux-red-500',
  };
  return [deleteOption];
});

onMounted(() => {
  if (!shouldUseMock.value) {
    autoWidgetsStore.loadAgentInvocationData();
    if (!projectStore.agentsTeam.agents.length) {
      projectStore.getAgentsTeam();
    }
  }
});

watch(
  () => route.query,
  () => {
    if (!shouldUseMock.value) {
      autoWidgetsStore.loadAgentInvocationData();
    }
  },
  { deep: true },
);

watch(
  () => conversational.refreshDataConversational,
  (newValue) => {
    if (newValue && !shouldUseMock.value) {
      conversational.setIsLoadingConversationalData('dynamicWidgets', true);
      autoWidgetsStore.loadAgentInvocationData().finally(() => {
        conversational.setIsLoadingConversationalData('dynamicWidgets', false);
      });
    }
  },
);
</script>

<style lang="scss" scoped>
.auto-widget {
  &__skeleton-container {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__footer {
    display: flex;
    align-items: center;
    margin-top: auto;
  }

  &__footer-count {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-emphasis;
    width: 100%;
  }
}
</style>
