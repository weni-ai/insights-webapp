import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import PerTag from '../PerTag.vue';
import volumePerTagService from '@/services/api/resources/humanSupport/volumePerTag';
import {
  monitoringVolumePerTagMock,
  monitoringVolumePerTagMockItemsCount,
} from '../../../Monitoring/mocks';
import {
  analysisVolumePerTagMock,
  analysisVolumePerTagMockItemsCount,
} from '../../../Analysis/mocks';

const redirectToChatsConfig = vi.fn();

vi.mock('@/utils/redirect', () => ({
  redirectToChatsConfig: (...args) => redirectToChatsConfig(...args),
}));

const VolumeBarListWidgetStub = {
  name: 'VolumeBarListWidget',
  props: [
    'titleKey',
    'tabs',
    'defaultTab',
    'mock',
    'mockItemsCount',
    'itemKey',
    'itemLabelKey',
    'formatFooterText',
    'formatEmptyDataText',
    'seeAllTitleKey',
    'setupDescription',
    'fetchMethod',
    'context',
    'showConfig',
    'hiddenTabs',
  ],
  emits: ['click:setup'],
  template: '<div class="volume-bar-list-widget-stub" />',
};

const createWrapper = (props = {}) =>
  mount(PerTag, {
    props: { context: 'monitoring', ...props },
    global: {
      stubs: {
        VolumeBarListWidget: VolumeBarListWidgetStub,
      },
    },
  });

describe('PerTag.vue', () => {
  let wrapper;

  beforeEach(() => {
    redirectToChatsConfig.mockClear();
    wrapper = createWrapper();
  });

  const widget = () => wrapper.findComponent({ name: 'VolumeBarListWidget' });

  describe('monitoring context', () => {
    it('should pass monitoring default tab and mocks', () => {
      expect(widget().props('defaultTab')).toBe('ongoing');
      expect(widget().props('mock')).toEqual(monitoringVolumePerTagMock);
      expect(widget().props('mockItemsCount')).toBe(
        monitoringVolumePerTagMockItemsCount,
      );
      expect(widget().props('hiddenTabs')).toBe(false);
      expect(widget().props('itemKey')).toBe('tags');
      expect(widget().props('itemLabelKey')).toBe('tag_name');
    });

    it('should return ongoing tab for monitoring', () => {
      const tabs = widget().props('tabs')('monitoring');
      expect(tabs).toHaveLength(1);
      expect(tabs[0].key).toBe('ongoing');
    });

    it('should format footer text for monitoring tab', () => {
      const text = widget().props('formatFooterText')(
        'monitoring',
        'ongoing',
        4,
      );
      expect(text).toBeTruthy();
    });

    it('should return empty footer text when count is 0', () => {
      expect(
        widget().props('formatFooterText')('monitoring', 'ongoing', 0),
      ).toBe('');
    });

    it('should return monitoring fetch method', () => {
      expect(widget().props('fetchMethod')('monitoring')).toBe(
        volumePerTagService.getVolumePerTagsMonitoring,
      );
    });

    it('should format empty data text for monitoring tab', () => {
      const text = widget().props('formatEmptyDataText')(
        'monitoring',
        'ongoing',
      );
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('analysis context', () => {
    beforeEach(() => {
      wrapper = createWrapper({ context: 'analysis' });
    });

    it('should pass analysis default tab and mocks', () => {
      expect(widget().props('defaultTab')).toBe('closed');
      expect(widget().props('mock')).toEqual(analysisVolumePerTagMock);
      expect(widget().props('mockItemsCount')).toBe(
        analysisVolumePerTagMockItemsCount,
      );
      expect(widget().props('hiddenTabs')).toBe(true);
    });

    it('should return closed tab for analysis', () => {
      const tabs = widget().props('tabs')('analysis');
      expect(tabs).toHaveLength(1);
      expect(tabs[0].key).toBe('closed');
    });

    it('should format footer text for analysis', () => {
      const text = widget().props('formatFooterText')('analysis', 'closed', 2);
      expect(text).toBeTruthy();
    });

    it('should return analysis fetch method', () => {
      expect(widget().props('fetchMethod')('analysis')).toBe(
        volumePerTagService.getVolumePerTagsAnalysis,
      );
    });
  });

  describe('setup click', () => {
    it('should call redirectToChatsConfig on click:setup', async () => {
      await widget().vm.$emit('click:setup');
      expect(redirectToChatsConfig).toHaveBeenCalledTimes(1);
    });
  });
});
