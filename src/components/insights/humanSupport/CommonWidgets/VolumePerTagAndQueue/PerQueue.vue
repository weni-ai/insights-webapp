<template>
  <VolumeBarListWidget
    titleKey="human_support_dashboard.volume_per_queue.title"
    :tabs="tabs"
    :defaultTab="defaultTab"
    :mock="mock"
    :mockItemsCount="mockItemsCount"
    barColor="#E5812A"
    barBackgroundColor="#FBEED9"
    itemKey="queues"
    itemLabelKey="queue_name"
    :formatFooterText="formatFooterText"
    :formatEmptyDataText="formatEmptyDataText"
    seeAllTitleKey="human_support_dashboard.volume_per_queue.title"
    :setupDescription="
      t('human_support_dashboard.volume_per_queue.setup_description')
    "
    :fetchMethod="fetchMethod"
    :context="props.context"
    :showConfig="props.showConfig"
    @click:setup="redirectToChatsConfig"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import VolumeBarListWidget from './VolumeBarListWidget.vue';

import type { VolumeBarListTabItem, WidgetContext } from './types';

import volumePerQueueService from '@/services/api/resources/humanSupport/volumePerQueue';

import { redirectToChatsConfig } from '@/utils/redirect';

import i18n from '@/utils/plugins/i18n';
const { t, tc } = i18n.global;

import {
  monitoringVolumePerQueueMock,
  monitoringVolumePerQueueMockItemsCount,
} from '../../Monitoring/mocks';
import {
  analysisVolumePerQueueMock,
  analysisVolumePerQueueMockItemsCount,
} from '../../Analysis/mocks';

defineOptions({
  name: 'PerQueue',
});

interface PerQueueProps {
  context: WidgetContext;
  showConfig?: boolean;
}

const props = withDefaults(defineProps<PerQueueProps>(), {
  showConfig: false,
});

const tabs = (ctx: WidgetContext): VolumeBarListTabItem[] => {
  if (ctx === 'monitoring') {
    return [
      { name: t('awaiting'), key: 'waiting' },
      { name: t('in_progress'), key: 'ongoing' },
      { name: t('finished'), key: 'closed' },
    ];
  }
  return [{ name: t('finished'), key: 'closed' }];
};

const defaultTab = computed(() =>
  props.context === 'monitoring' ? 'ongoing' : 'closed',
);

const mock = computed(() => {
  if (props.context === 'monitoring') {
    return monitoringVolumePerQueueMock;
  }
  return analysisVolumePerQueueMock;
});

const mockItemsCount = computed(() => {
  if (props.context === 'monitoring') {
    return monitoringVolumePerQueueMockItemsCount;
  }
  return analysisVolumePerQueueMockItemsCount;
});

const formatFooterText = (
  ctx: WidgetContext,
  _currentTab: string,
  count: number,
  statusLabel?: string,
) => {
  if (count === 0) return '';
  if (ctx === 'monitoring' && statusLabel) {
    return tc(
      'human_support_dashboard.volume_per_queue.monitoring_count',
      count,
      {
        count,
        status: statusLabel.toLocaleLowerCase(),
      },
    );
  }
  return tc('human_support_dashboard.volume_per_queue.analysis_count', count, {
    count,
  });
};

const formatEmptyDataText = (context: WidgetContext, currentTab?: string) =>
  t(
    `human_support_dashboard.volume_per_queue.empty_data.${context}.${currentTab}`,
  );

const fetchMethod = (ctx: WidgetContext) =>
  ctx === 'monitoring'
    ? volumePerQueueService.getVolumePerQueueMonitoring
    : volumePerQueueService.getVolumePerQueueAnalysis;
</script>
