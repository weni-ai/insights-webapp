import { describe, it, expect, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';

import VtexConversionsWidget from '../CardVtexConversions.vue';

import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const createWrapper = () => {
  return mount(VtexConversionsWidget, {
    global: { plugins: [UnnnicSystem] },
    props: { widget: { name: 'Widget' } },
  });
};

describe('VtexConversionsWidget.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('should show loading state when isLoadingData is true', async () => {
    await wrapper.setProps({ isLoadingData: true });
    expect(
      wrapper.find('[data-testid="vtex-conversions-loading"]').exists(),
    ).toBe(true);
  });

  it('should show error state when hasError is true', async () => {
    await wrapper.setProps({ data: { error: true } });
    expect(
      wrapper.find('[data-testid="vtex-conversions-error"]').exists(),
    ).toBe(true);
    expect(wrapper.find('img').attributes('src')).toContain('empty_cloud.svg');
    expect(wrapper.text()).toContain(
      i18n.global.t('widgets.vtex_order.empty_data.title'),
    );
    expect(wrapper.text()).toContain(
      i18n.global.t('widgets.vtex_order.empty_data.sub_title'),
    );
  });

  it('should emit "open-config" when error button is clicked', async () => {
    const button = wrapper.findComponent('[data-testid="open-config-button"]');

    await button.trigger('click');

    expect(wrapper.emitted('open-config')).toBeTruthy();
  });

  it('should show widget data when data is valid', async () => {
    const dataMock = {
      utm_data: {
        count_sell: 42,
        accumulated_total: 1500,
        medium_ticket: 35.71,
      },
      graph_data: {
        sent: { value: 1000, percentage: 100 },
        delivered: { value: 900, percentage: 90 },
        read: { value: 800, percentage: 80 },
        clicked: { value: 700, percentage: 70 },
        orders: { value: 100, percentage: 10 },
      },
    };

    await wrapper.setProps({ data: dataMock });

    expect(wrapper.find('[data-testid="vtex-conversions-title"]').text()).toBe(
      'Widget',
    );
    expect(wrapper.text()).toContain(dataMock.utm_data.count_sell.toString());
    expect(wrapper.text()).toContain(
      dataMock.utm_data.accumulated_total.toString(),
    );
    expect(wrapper.text()).toContain(
      dataMock.utm_data.medium_ticket.toString(),
    );
    expect(
      wrapper
        .findComponent('[data-testid="vtex-conversions-meta-graph"]')
        .exists(),
    ).toBe(true);
  });

  it('should emit "open-config" when gear button is clicked', async () => {
    const gearButton = wrapper.findAllComponents(
      '[data-testid="open-config-button"]',
    )[0];

    await gearButton.trigger('click');

    expect(wrapper.emitted('open-config')).toBeTruthy();
  });

  it('should emit "open-config" when empty data verify button is clicked', async () => {
    await wrapper.setProps({ data: { error: true } });

    const button = wrapper.findComponent(
      '[data-testid="empty-data-verify-button"]',
    );

    await button.trigger('click');

    expect(wrapper.emitted('open-config')).toBeTruthy();
  });
});
