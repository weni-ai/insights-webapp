import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import PerQueue from '../PerQueue.vue';
import volumePerQueueService from '@/services/api/resources/humanSupport/volumePerQueue';
import {
  monitoringVolumePerQueueMock,
  monitoringVolumePerQueueMockItemsCount,
} from '../../../Monitoring/mocks';
import {
  analysisVolumePerQueueMock,
  analysisVolumePerQueueMockItemsCount,
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
    'barColor',
    'barBackgroundColor',
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
  mount(PerQueue, {
    props: { context: 'monitoring', ...props },
    global: {
      stubs: {
        VolumeBarListWidget: VolumeBarListWidgetStub,
      },
    },
  });

describe('PerQueue.vue', () => {
  let wrapper;

  beforeEach(() => {
    redirectToChatsConfig.mockClear();
    wrapper = createWrapper();
  });

  const widget = () => wrapper.findComponent({ name: 'VolumeBarListWidget' });

  describe('monitoring context', () => {
    it('should pass monitoring default tab and mocks', () => {
      expect(widget().props('defaultTab')).toBe('ongoing');
      expect(widget().props('mock')).toEqual(monitoringVolumePerQueueMock);
      expect(widget().props('mockItemsCount')).toBe(
        monitoringVolumePerQueueMockItemsCount,
      );
      expect(widget().props('hiddenTabs')).toBe(false);
      expect(widget().props('itemKey')).toBe('queues');
      expect(widget().props('itemLabelKey')).toBe('queue_name');
    });

    it('should return waiting and ongoing tabs for monitoring', () => {
      const tabs = widget().props('tabs')('monitoring');
      expect(tabs).toHaveLength(2);
      expect(tabs.map((tab) => tab.key)).toEqual(['waiting', 'ongoing']);
    });

    it('should format footer text for monitoring with status label', () => {
      const text = widget().props('formatFooterText')(
        'monitoring',
        'ongoing',
        5,
        'In Progress',
      );
      expect(text).toBeTruthy();
      expect(text.toLowerCase()).toContain('in progress');
    });

    it('should return empty footer text when count is 0', () => {
      expect(
        widget().props('formatFooterText')('monitoring', 'ongoing', 0, 'Awaiting'),
      ).toBe('');
    });

    it('should return monitoring fetch method', () => {
      expect(widget().props('fetchMethod')('monitoring')).toBe(
        volumePerQueueService.getVolumePerQueueMonitoring,
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
      expect(widget().props('mock')).toEqual(analysisVolumePerQueueMock);
      expect(widget().props('mockItemsCount')).toBe(
        analysisVolumePerQueueMockItemsCount,
      );
      expect(widget().props('hiddenTabs')).toBe(true);
    });

    it('should return closed tab for analysis', () => {
      const tabs = widget().props('tabs')('analysis');
      expect(tabs).toHaveLength(1);
      expect(tabs[0].key).toBe('closed');
    });

    it('should format footer text for analysis', () => {
      const text = widget().props('formatFooterText')('analysis', 'closed', 3);
      expect(text).toBeTruthy();
    });

    it('should return analysis fetch method', () => {
      expect(widget().props('fetchMethod')('analysis')).toBe(
        volumePerQueueService.getVolumePerQueueAnalysis,
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
