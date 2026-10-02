import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import SalesPerChannel from '../SalesPerChannel.vue';
import { useConfig } from '@/store/modules/config';
import { getChannelLabelComponent } from '@/components/insights/humanSupport/Common/ChannelIcons/channelIconMap';
import PerChannelDataService from '@/services/api/resources/humanSupport/sales/perChannelData';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      human_support_dashboard: {
        sales: {
          channel: {
            empty_data: 'No sales in the selected period',
            footer_text: '{count, plural, one {# channel} other {# channels}}',
            tabs: {
              revenue: 'Revenue',
              sale: 'Sale',
            },
            title: 'Channel',
          },
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const createVolumeBarListWidgetStub = (currentTab = 'revenue') => ({
  name: 'VolumeBarListWidget',
  props: [
    'titleKey',
    'tabs',
    'defaultTab',
    'itemKey',
    'itemLabelKey',
    'formatFooterText',
    'formatEmptyDataText',
    'fetchMethod',
    'context',
    'showConfig',
    'seeAllTitleKey',
    'barColor',
    'barBackgroundColor',
    'labelComponentResolver',
    'formatItemDescription',
  ],
  template: `<div data-testid="volume-bar-list-widget"><slot name="description" :item="{ description: '${currentTab === 'revenue' ? '$124,500.00' : '1,245'}', percentage: 29.06 }" currentTab="${currentTab}" /></div>`,
});

const createWrapper = (currentTab = 'revenue') =>
  mount(SalesPerChannel, {
    global: {
      stubs: {
        VolumeBarListWidget: createVolumeBarListWidgetStub(currentTab),
      },
    },
  });

const findWidget = (wrapper) =>
  wrapper.findComponent({ name: 'VolumeBarListWidget' });

describe('SalesPerChannel.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    useConfig().setProject({ uuid: 'test-project', currency: 'USD' });
  });

  it('configures VolumeBarListWidget with channel tabs', () => {
    const wrapper = createWrapper();
    const widget = findWidget(wrapper);

    expect(widget.exists()).toBe(true);
    expect(widget.props('titleKey')).toBe(
      'human_support_dashboard.sales.channel.title',
    );
    expect(widget.props('defaultTab')).toBe('revenue');
    expect(widget.props('context')).toBe('sales');
    expect(widget.props('itemKey')).toBe('channels');
    expect(widget.props('itemLabelKey')).toBe('channel_name');
    expect(widget.props('showConfig')).toBe(false);

    expect(widget.props('tabs')('sales')).toEqual([
      { name: 'Revenue', key: 'revenue' },
      { name: 'Sale', key: 'sale' },
    ]);
  });

  it('stacks revenue description into two lines', () => {
    const wrapper = createWrapper('revenue');
    const description = wrapper.find(
      '[data-testid="sales-per-channel-description"]',
    );

    expect(description.exists()).toBe(true);
    expect(description.classes()).toContain(
      'sales-per-channel__description--stacked',
    );
    expect(description.text()).toContain('$124,500.00');
    expect(description.text()).toContain('(29.06%)');
  });

  it('keeps sale description in a single line', () => {
    const wrapper = createWrapper('sale');
    const description = wrapper.find(
      '[data-testid="sales-per-channel-description"]',
    );

    expect(description.exists()).toBe(true);
    expect(description.classes()).not.toContain(
      'sales-per-channel__description--stacked',
    );
    expect(description.text()).toContain('1,245');
    expect(description.text()).toContain('(29.06%)');
  });

  it('formats revenue value with project currency', () => {
    const wrapper = createWrapper();
    const widget = findWidget(wrapper);

    const description = widget.props('formatItemDescription')(
      { label: 'whatsapp', value: 124500, percentage: 29.06 },
      'revenue',
    );

    expect(description).toBe('$124,500.00');
  });

  it('formats sale value as a quantity without currency', () => {
    const wrapper = createWrapper();
    const widget = findWidget(wrapper);

    const description = widget.props('formatItemDescription')(
      { label: 'whatsapp', value: 1245, percentage: 29.06 },
      'sale',
    );

    expect(description).toBe('1,245');
  });

  it('formats footer and empty data texts', () => {
    const wrapper = createWrapper();
    const widget = findWidget(wrapper);

    expect(widget.props('formatFooterText')('sales', 'revenue', 7)).toBe(
      '7 channels',
    );
    expect(widget.props('formatFooterText')('sales', 'revenue', 0)).toBe('');
    expect(widget.props('formatEmptyDataText')()).toBe(
      'No sales in the selected period',
    );
  });

  it('resolves channel icons and fetch method', () => {
    const wrapper = createWrapper();
    const widget = findWidget(wrapper);

    expect(widget.props('labelComponentResolver')('whatsapp')).toBe(
      getChannelLabelComponent('whatsapp'),
    );
    expect(widget.props('fetchMethod')()).toBe(
      PerChannelDataService.getPerChannelData,
    );
  });
});
