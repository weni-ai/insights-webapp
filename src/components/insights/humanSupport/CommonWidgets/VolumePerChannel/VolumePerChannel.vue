<template>
  <VolumeBarListWidget
    titleKey="human_support_dashboard.volume_per_channel.title"
    :tabs="tabs"
    :defaultTab="defaultTab"
    itemKey="channels"
    itemLabelKey="channel_name"
    :formatFooterText="formatFooterText"
    :formatEmptyDataText="formatEmptyDataText"
    :fetchMethod="fetchMethod"
    :context="props.context"
    :showConfig="false"
    seeAllTitleKey="human_support_dashboard.volume_per_channel.title"
    :barColor="colorBgPinkStrong"
    :barBackgroundColor="colorBgPinkPlain"
    :labelComponentResolver="resolveChannelLabelComponent"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import VolumeBarListWidget from '../VolumeList/VolumeBarListWidget.vue';

import { getChannelLabelComponent } from '../../Common/ChannelIcons/channelIconMap';

import VolumePerChannelService from '@/services/api/resources/humanSupport/volumePerChannel';

import {
  colorBgPinkPlain,
  colorBgPinkStrong,
} from '@weni/unnnic-system/tokens/colors';

import type {
  VolumeBarListFetchMethod,
  VolumeBarListTabItem,
  WidgetContext,
} from '../VolumeList/types';

import i18n from '@/utils/plugins/i18n';

defineOptions({
  name: 'VolumePerChannel',
});

interface VolumePerChannelWidgetProps {
  context: WidgetContext;
}

const { t } = i18n.global;

const props = withDefaults(defineProps<VolumePerChannelWidgetProps>(), {});

const tabs = (ctx: WidgetContext): VolumeBarListTabItem[] => {
  if (ctx === 'monitoring') {
    return [
      { name: t('awaiting'), key: 'waiting' },
      { name: t('in_progress'), key: 'ongoing' },
    ];
  }
  return [{ name: t('finished'), key: 'closed' }];
};

const defaultTab = computed(() =>
  props.context === 'monitoring' ? 'ongoing' : 'closed',
);

const formatFooterText = (
  ctx: WidgetContext,
  _currentTab: string,
  count: number,
  statusLabel?: string,
) => {
  if (!count) return '';
  return t(`human_support_dashboard.volume_per_channel.footer_text.${ctx}`, {
    status: statusLabel,
    count,
  });
};

const formatEmptyDataText = (context: WidgetContext, currentTab: string) => {
  return t(
    `human_support_dashboard.volume_per_channel.empty_data.${context}.${currentTab}`,
  );
};

const fetchMethod = (ctx: WidgetContext): VolumeBarListFetchMethod => {
  if (ctx === 'monitoring') {
    return VolumePerChannelService.getVolumePerChannelMonitoring;
  }
  return VolumePerChannelService.getVolumePerChannelAnalysis;
};

const resolveChannelLabelComponent = (channelName: string) =>
  getChannelLabelComponent(channelName);
</script>
