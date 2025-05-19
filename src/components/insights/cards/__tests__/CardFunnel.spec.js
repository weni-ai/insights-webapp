import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import { createPinia } from 'pinia';
import { useDashboards } from '@/store/modules/dashboards';

import CardFunnel from '../CardFunnel.vue';

const widgetMock = {
  uuid: '1',
  is_configurable: true,
  report: null,
  name: 'Funil',
  type: 'graph_funnel',
  source: '',
  config: {},
  position: {
    rows: [1, 3],
    columns: [9, 12],
  },
  dashboard: '1',
};

const store = createPinia();

const createWraper = (props) => {
  return mount(CardFunnel, {
    props,
    global: {
      plugins: [store],
    },
  });
};

describe('CardFunnel', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = createWraper({
      widget: widgetMock,
      chartData: [],
      isLoading: false,
      configured: false,
      configurable: true,
    });
  });

  it('renders correctly when not configured', () => {
    expect(wrapper.findComponent({ name: 'CardBase' }).exists()).toBeTruthy();
    expect(wrapper.findComponent({ name: 'FunnelChart' }).exists()).toBeFalsy();

    expect(
      wrapper
        .findComponent(
          '[data-testid="card-funnel-config-button-not-configured"]',
        )
        .exists(),
    ).toBeTruthy();

    expect(wrapper.text()).toContain(
      wrapper.vm.$t('widgets.graph_funnel.not_configured_description'),
    );
  });

  it('renders correctly when configured', async () => {
    await wrapper.setProps({ configured: true });

    expect(wrapper.findComponent({ name: 'FunnelChart' }).exists()).toBe(true);
    expect(
      wrapper
        .findComponent('[data-testid="card-funnel-config-button-configurable"]')
        .exists(),
    ).toBeTruthy();
  });

  it('emits "open-config" event when config button is clicked (not configured)', async () => {
    const configButton = wrapper.findComponent(
      '[data-testid="card-funnel-config-button-not-configured"]',
    );

    await configButton.trigger('click');

    expect(wrapper.emitted('open-config')).toBeTruthy();
  });

  it('emits "open-config" event when config button is clicked (configured)', async () => {
    await wrapper.setProps({ configured: true });
    const configButton = wrapper.findComponent(
      '[data-testid="card-funnel-config-button-configurable"]',
    );

    await configButton.trigger('click');

    expect(wrapper.emitted('open-config')).toBeTruthy();
  });

  it('emits "request-data" on creation and when appliedFilters change', async () => {
    const dashboardStore = useDashboards();

    const emitRequestDataSpy = vi.spyOn(CardFunnel.methods, 'emitRequestData');

    createWraper({
      configured: true,
      chartData: [],
      widget: widgetMock,
    });

    expect(emitRequestDataSpy).toHaveBeenCalledTimes(1);

    await dashboardStore.setAppliedFilters({
      test: 'key',
    });

    expect(emitRequestDataSpy).toHaveBeenCalledTimes(2);
  });
});
