<template>
  <VolumeBarListWidget
    titleKey="human_support_dashboard.volume_per_tag.title"
    :tabs="tabs"
    :defaultTab="defaultTab"
    :mock="mock"
    itemKey="tags"
    itemLabelKey="tag_name"
    :formatFooterText="formatFooterText"
    seeAllTitleKey="human_support_dashboard.volume_per_tag.title"
    :fetchMethod="fetchMethod"
    :context="props.context"
    :showConfig="props.showConfig"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import VolumeBarListWidget from './VolumeBarListWidget.vue';
import type { VolumeBarListTabItem, WidgetContext } from './types';

import i18n from '@/utils/plugins/i18n';
import volumePerTagService from '@/services/api/resources/humanSupport/volumePerTag';

const { t } = i18n.global;

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

const mock = {
  labelPrefix: 'Tag',
  subtitle: 'Tag sector',
  color: '#3182CE',
  backgroundColor: '#E5EEF9',
};

const formatFooterText = (
  _ctx: WidgetContext,
  currentTab: string,
  count: number,
) =>
  t(`human_support_dashboard.volume_per_tag.count.${currentTab}`, {
    count,
  });

const fetchMethod = (ctx: WidgetContext) =>
  ctx === 'monitoring'
    ? volumePerTagService.getVolumePerTagsMonitoring
    : volumePerTagService.getVolumePerTagsAnalysis;
</script>

<style scoped lang="scss"></style>
