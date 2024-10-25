import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import CardEmpty from '@/components/insights/cards/CardEmpty.vue';

const widgetMock = {
  uuid: '1',
  name: 'Empty Widget',
  type: 'empty_column',
  position: {
    rows: [1, 3],
    columns: [9, 12],
  },
};

const createWrapper = (props = {}) => {
  return mount(CardEmpty, {
    props: {
      widget: widgetMock,
      isLoading: false,
      ...props,
    },
    global: {
      stubs: {
        UnnnicButton: true,
      },
    },
  });
};

describe('CardEmpty', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  it('renders component structure correctly', () => {
    expect(wrapper.findComponent({ name: 'CardBase' }).exists()).toBeTruthy();
    expect(wrapper.find('.card-empty').exists()).toBeTruthy();
    expect(wrapper.find('.card-empty__content').exists()).toBeTruthy();
    expect(wrapper.find('.content__not-configured').exists()).toBeTruthy();
  });

  it('renders content elements correctly', () => {
    expect(wrapper.find('.not-configured__text').exists()).toBeTruthy();
    expect(wrapper.text()).toContain(
      wrapper.vm.$t('widgets.empty_widget.title'),
    );

    expect(wrapper.find('img').exists()).toBeTruthy();
    expect(wrapper.find('img').attributes('src')).toContain(
      'empty_monitory.svg',
    );
  });

  it('renders UnnnicButton with correct props', () => {
    const button = wrapper.findComponent(
      '[data-testid="card-empty-config-button-not-configured"]',
    );
    expect(button.exists()).toBeTruthy();
    expect(button.attributes('type')).toBe('primary');
    expect(button.attributes('size')).toBe('small');
    expect(button.attributes('text')).toBe(
      wrapper.vm.$t('widgets.empty_widget.config_btn'),
    );
  });

  it('emits "open-config" event when button is clicked', async () => {
    const button = wrapper.findComponent(
      '[data-testid="card-empty-config-button-not-configured"]',
    );
    await button.trigger('click');

    expect(wrapper.emitted('open-config')).toBeTruthy();
    expect(wrapper.emitted('open-config')).toHaveLength(1);
  });

  it('accepts isLoading prop as boolean', async () => {
    expect(wrapper.props('isLoading')).toBe(false);

    await wrapper.setProps({ isLoading: true });
    expect(wrapper.props('isLoading')).toBe(true);
  });
});
