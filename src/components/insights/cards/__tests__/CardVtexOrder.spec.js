import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';

import CardVtexOrder from '@/components/insights/cards/CardVtexOrder.vue';
import dashboards from '@/store/modules/dashboards';

const widgetMock = {
  uuid: '1',
  name: 'VTEX Order',
  type: 'vtex_order',
  config: {
    orders: {
      icon: 'local_activity',
    },
    total_value: {
      icon: 'payments',
    },
  },
  position: {
    rows: [1, 3],
    columns: [9, 12],
  },
};

const dataMock = {
  orders: '150',
  total_value: '$5000',
};

const store = createStore({
  modules: {
    dashboards: {
      namespaced: true,
      ...dashboards,
    },
  },
});

const createWrapper = (props = {}) => {
  return mount(CardVtexOrder, {
    props: {
      widget: widgetMock,
      data: dataMock,
      isLoading: false,
      ...props,
    },
    global: {
      plugins: [store],
      stubs: {
        UnnnicButton: true,
        UnnnicAvatarIcon: true,
        IconLoading: true,
      },
    },
  });
};

describe('CardVtexOrder', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('renders correctly with data', () => {
    expect(wrapper.findComponent({ name: 'CardBase' }).exists()).toBeTruthy();
    expect(wrapper.find('.card-vtex-order__header').exists()).toBeTruthy();
    expect(wrapper.find('.content__orders__container').exists()).toBeTruthy();

    const orderItems = wrapper.findAll('.content__orders');
    expect(orderItems).toHaveLength(2);

    expect(wrapper.text()).toContain('150');
    expect(wrapper.text()).toContain('$5000');
  });

  it('renders loading state correctly', async () => {
    await wrapper.setProps({ isLoading: true });

    expect(
      wrapper.findComponent({ name: 'IconLoading' }).exists(),
    ).toBeTruthy();
    const orderItems = wrapper.findAll('.content__orders');
    expect(orderItems.map((item) => item.isVisible())).toEqual([false, false]);
  });

  it('renders error state correctly when no data', async () => {
    await wrapper.setProps({
      data: { orders: '', total_value: '' },
    });

    expect(wrapper.find('.content__not-configured').exists()).toBeTruthy();
    expect(wrapper.find('.not-configured__text').exists()).toBeTruthy();
    expect(
      wrapper
        .findComponent(
          '[data-testid="card-vtex-order-config-button-not-configured"]',
        )
        .exists(),
    ).toBeTruthy();
  });

  it('emits "open-config" when config button is clicked in normal state', async () => {
    const configButton = wrapper.findComponent(
      '[data-testid="card-vtex-order-config-button-configurable"]',
    );
    await configButton.trigger('click');

    expect(wrapper.emitted('open-config')).toBeTruthy();
    expect(wrapper.emitted('open-config')).toHaveLength(1);
  });

  it('emits "open-config" when config button is clicked in error state', async () => {
    await wrapper.setProps({
      data: { orders: '', total_value: '' },
    });

    const configButton = wrapper.findComponent(
      '[data-testid="card-vtex-order-config-button-not-configured"]',
    );
    await configButton.trigger('click');

    expect(wrapper.emitted('open-config')).toBeTruthy();
    expect(wrapper.emitted('open-config')).toHaveLength(1);
  });

  it('computes dataList correctly with valid data', () => {
    expect(wrapper.vm.dataList).toEqual([
      {
        label: wrapper.vm.$t('widgets.vtex_order.orders'),
        icon: 'local_activity',
        value: '150',
      },
      {
        label: wrapper.vm.$t('widgets.vtex_order.total_value'),
        icon: 'payments',
        value: '$5000',
      },
    ]);
  });

  it('computes dataList as empty array when in error state', async () => {
    await wrapper.setProps({
      data: { orders: '', total_value: '' },
    });

    expect(wrapper.vm.dataList).toEqual([]);
  });

  it('computes isError correctly', async () => {
    expect(wrapper.vm.isError).toBeFalsy();

    await wrapper.setProps({
      data: { orders: '', total_value: '' },
    });

    expect(wrapper.vm.isError).toBeTruthy();
  });

  it('emits "request-data" on creation', () => {
    expect(wrapper.emitted('request-data')).toBeTruthy();
    expect(wrapper.emitted('request-data')).toHaveLength(1);
  });

  it('emits "request-data" when appliedFilters change', async () => {
    await wrapper.vm.$store.commit('dashboards/SET_APPLIED_FILTERS', {
      test: 'key',
    });

    expect(wrapper.emitted('request-data')).toHaveLength(2);
  });

  it('applies not-data class when in error state', async () => {
    await wrapper.setProps({
      data: { orders: '', total_value: '' },
    });

    expect(wrapper.classes()).toContain('card-vtex-order--not-data');
  });

  it('computes dataList with default icon when widget config icon is missing', async () => {
    const widgetWithoutIcon = {
      ...widgetMock,
      config: {
        orders: {},
        total_value: {
          icon: 'payments',
        },
      },
    };

    await wrapper.setProps({
      widget: widgetWithoutIcon,
      data: {
        orders: '150',
        total_value: '$5000',
      },
    });

    expect(wrapper.vm.dataList).toEqual([
      {
        label: wrapper.vm.$t('widgets.vtex_order.orders'),
        icon: 'local_activity',
        value: '150',
      },
      {
        label: wrapper.vm.$t('widgets.vtex_order.total_value'),
        icon: 'payments',
        value: '$5000',
      },
    ]);
  });

  it('computes dataList with empty string value when data value is null or undefined', async () => {
    await wrapper.setProps({
      data: {
        orders: null,
        total_value: undefined,
      },
    });

    expect(wrapper.vm.dataList).toEqual([
      {
        label: wrapper.vm.$t('widgets.vtex_order.orders'),
        icon: 'local_activity',
        value: '',
      },
      {
        label: wrapper.vm.$t('widgets.vtex_order.total_value'),
        icon: 'payments',
        value: '',
      },
    ]);
  });
});
