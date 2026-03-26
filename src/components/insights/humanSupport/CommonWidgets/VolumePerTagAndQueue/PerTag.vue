<template>
  <VolumeBarListWidget
    titleKey="human_support_dashboard.volume_per_tag.title"
    :tabs="tabs"
    :defaultTab="defaultTab"
    :mock="mock"
    :mockItemsCount="mockItemsCount"
    itemKey="tags"
    itemLabelKey="tag_name"
    :formatFooterText="formatFooterText"
    :formatEmptyDataText="formatEmptyDataText"
    seeAllTitleKey="human_support_dashboard.volume_per_tag.title"
    :setupDescription="
      t('human_support_dashboard.volume_per_tag.setup_description')
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

import volumePerTagService from '@/services/api/resources/humanSupport/volumePerTag';

import { redirectToChatsConfig } from '@/utils/redirect';

import i18n from '@/utils/plugins/i18n';
const { t, tc } = i18n.global;

import {
  monitoringVolumePerTagMock,
  monitoringVolumePerTagMockItemsCount,
} from '../../Monitoring/mocks';
import {
  analysisVolumePerTagMock,
  analysisVolumePerTagMockItemsCount,
} from '../../Analysis/mocks';

defineOptions({
  name: 'PerTag',
});

interface PerTagProps {
  context: WidgetContext;
  showConfig?: boolean;
}

const props = withDefaults(defineProps<PerTagProps>(), {
  showConfig: false,
});

const tabs = (ctx: WidgetContext): VolumeBarListTabItem[] => {
  if (ctx === 'monitoring') {
    return [
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
    return monitoringVolumePerTagMock;
  }
  return analysisVolumePerTagMock;
});

const mockItemsCount = computed(() => {
  if (props.context === 'monitoring') {
    return monitoringVolumePerTagMockItemsCount;
  }
  return analysisVolumePerTagMockItemsCount;
});

const formatFooterText = (
  _ctx: WidgetContext,
  currentTab: string,
  count: number,
) => {
  if (count === 0) return '';
  return tc(
    `human_support_dashboard.volume_per_tag.count.${currentTab}`,
    count,
    {
      count,
    },
  );
};

const formatEmptyDataText = (context: WidgetContext, currentTab: string) =>
  t(
    `human_support_dashboard.volume_per_tag.empty_data.${context}.${currentTab}`,
  );

const fetchMethod = (ctx: WidgetContext) =>
  ctx === 'monitoring'
    ? volumePerTagService.getVolumePerTagsMonitoring
    : volumePerTagService.getVolumePerTagsAnalysis;
</script>
