<template>
  <VolumeBarListWidget
    titleKey="human_support_dashboard.sales.channel.title"
    :tabs="tabs"
    defaultTab="revenue"
    itemKey="channels"
    itemLabelKey="channel_name"
    :formatFooterText="formatFooterText"
    :formatEmptyDataText="formatEmptyDataText"
    :fetchMethod="fetchMethod"
    context="sales"
    :showConfig="false"
    seeAllTitleKey="human_support_dashboard.sales.channel.title"
    :barColor="colorBgPinkStrong"
    :barBackgroundColor="colorBgPinkPlain"
    :labelComponentResolver="resolveChannelLabelComponent"
    :formatItemDescription="formatItemDescription"
  >
    <template #description="{ item, currentTab }">
      <section
        :class="[
          'sales-per-channel__description',
          {
            'sales-per-channel__description--stacked': currentTab === 'revenue',
          },
        ]"
        data-testid="sales-per-channel-description"
      >
        <span>{{ item.description }}</span>
        <span>({{ formatPercentageFixed(item.percentage ?? 0) }})</span>
      </section>
    </template>
  </VolumeBarListWidget>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import VolumeBarListWidget from '@/components/insights/humanSupport/CommonWidgets/VolumeList/VolumeBarListWidget.vue';

import { getChannelLabelComponent } from '@/components/insights/humanSupport/Common/ChannelIcons/channelIconMap';

import PerChannelDataService from '@/services/api/resources/humanSupport/sales/perChannelData';

import { useConfig } from '@/store/modules/config';

import {
  colorBgPinkPlain,
  colorBgPinkStrong,
} from '@weni/unnnic-system/tokens/colors';

import type {
  VolumeBarListFetchMethod,
  VolumeBarListItemDescription,
  VolumeBarListTabItem,
  WidgetContext,
} from '@/components/insights/humanSupport/CommonWidgets/VolumeList/types';

import i18n from '@/utils/plugins/i18n';
import {
  formatCurrency,
  formatNumber,
  formatPercentageFixed,
} from '@/utils/numbers';

defineOptions({
  name: 'SalesPerChannel',
});

const { t } = i18n.global;
const { projectCurrency } = storeToRefs(useConfig());

const tabs = (_ctx: WidgetContext): VolumeBarListTabItem[] => [
  {
    name: t('human_support_dashboard.sales.channel.tabs.revenue'),
    key: 'revenue',
  },
  {
    name: t('human_support_dashboard.sales.channel.tabs.sale'),
    key: 'sale',
  },
];

const formatFooterText = (
  _ctx: WidgetContext,
  _currentTab: string,
  count: number,
) => {
  if (!count) return '';
  return t('human_support_dashboard.sales.channel.footer_text', { count });
};

const formatEmptyDataText = () =>
  t('human_support_dashboard.sales.channel.empty_data');

const fetchMethod = (): VolumeBarListFetchMethod =>
  PerChannelDataService.getPerChannelData;

const resolveChannelLabelComponent = (channelName: string) =>
  getChannelLabelComponent(channelName);

const formatItemDescription = (
  item: VolumeBarListItemDescription,
  currentTab: string,
) => {
  if (currentTab === 'revenue') {
    return formatCurrency(item.value, projectCurrency.value);
  }

  return formatNumber(item.value);
};
</script>

<style scoped lang="scss">
.sales-per-channel__description {
  display: flex;
  align-items: flex-end;
  white-space: nowrap;
  gap: $unnnic-space-1;
  @include unnnic-font-emphasis;

  &--stacked {
    flex-direction: column;
    gap: 0;
  }
}
</style>
