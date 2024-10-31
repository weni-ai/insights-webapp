import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DrawerConfigContentVtex from '@/components/insights/drawers/DrawerConfigContentVtex.vue';

const createWrapper = (modelValue) => {
  return mount(DrawerConfigContentVtex, {
    props: {
      modelValue,
    },
    global: {
      stubs: {
        UnnnicLabel: true,
        UnnnicButton: true,
      },
    },
  });
};

describe('DrawerConfigContentVtex', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper({
      type: 'vtex_order',
      config: {
        filter: {
          utm: 'test_utm',
        },
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.find('.content-vtex').exists()).toBeTruthy();
    expect(
      wrapper.findComponent({ name: 'UnnnicLabel' }).exists(),
    ).toBeTruthy();
    expect(
      wrapper.findComponent({ name: 'UnnnicInput' }).exists(),
    ).toBeTruthy();
    expect(
      wrapper.findComponent({ name: 'UnnnicButton' }).exists(),
    ).toBeTruthy();
  });

  it('computes utmValue correctly from modelValue', () => {
    expect(wrapper.vm.utmValue).toBe('test_utm');
  });

  it('sets utmValue correctly and emits update:model-value', async () => {
    const newUtmValue = 'new_test_utm';
    wrapper.vm.utmValue = newUtmValue;

    expect(wrapper.emitted('update:model-value')).toBeTruthy();
    expect(wrapper.emitted('update:model-value')[0][0].config.filter.utm).toBe(
      newUtmValue,
    );
  });

  it('computes isDisableResetWidget correctly', async () => {
    expect(wrapper.vm.isDisableResetWidget).toBe(false);

    await wrapper.setProps({
      modelValue: { type: 'empty_column' },
    });

    expect(wrapper.vm.isDisableResetWidget).toBe(true);
  });

  it('emits reset-widget when resetWidget method is called', () => {
    wrapper.vm.resetWidget();

    expect(wrapper.emitted('reset-widget')).toBeTruthy();
    expect(wrapper.emitted('reset-widget')).toHaveLength(1);
  });

  it('UnnnicButton is disabled when isDisableResetWidget is true', async () => {
    await wrapper.setProps({
      modelValue: { type: 'empty_column' },
    });

    const button = wrapper.findComponent({ name: 'UnnnicButton' });
    expect(button.attributes('disabled')).toBeTruthy();
  });

  it('UnnnicButton is enabled when isDisableResetWidget is false', () => {
    const button = wrapper.findComponent({ name: 'UnnnicButton' });
    expect(button.attributes('disabled')).toBe('false');
  });

  it('renders UnnnicButton with correct text', () => {
    const button = wrapper.findComponent({ name: 'UnnnicButton' });
    expect(button.attributes('text')).toBe(
      wrapper.vm.$t('drawers.reset_widget'),
    );
  });

  it('renders correctly with default modelValue', () => {
    const customWrapper = createWrapper();
    expect(customWrapper.vm.utmValue).toBe('');
    expect(customWrapper.vm.isDisableResetWidget).toBe(false);
  });

  it('emits update:model-value with defaultConfigVtex when utmValue is updated', async () => {
    const customWrapper = createWrapper();
    const newUtmValue = 'new-utm-value';
    customWrapper.vm.utmValue = newUtmValue;

    expect(customWrapper.emitted('update:model-value')).toBeTruthy();
    const emittedValue = customWrapper.emitted('update:model-value')[0][0];
    expect(emittedValue.config.filter.utm).toBe(newUtmValue);
    expect(emittedValue.config.orders.icon).toBe('local_activity');
    expect(emittedValue.config.total_value.icon).toBe('currency_exchange');
    expect(emittedValue.config.average_ticket.icon).toBe('sell');
  });

  it('emits reset-widget correctly when resetWidget is called', async () => {
    const customWrapper = createWrapper();
    await customWrapper
      .findComponent({ name: 'UnnnicButton' })
      .trigger('click');

    expect(customWrapper.emitted('reset-widget')).toBeTruthy();
    expect(customWrapper.emitted('reset-widget')).toHaveLength(1);
  });

  it('renders with default props and behaves correctly when no modelValue is provided', async () => {
    const customWrapper = createWrapper();

    expect(customWrapper.exists()).toBeTruthy();
    expect(customWrapper.vm.modelValue).toEqual({});

    expect(customWrapper.vm.utmValue).toBe('');
    expect(customWrapper.vm.isDisableResetWidget).toBe(false);

    const newUtmValue = 'utm-test-value';
    customWrapper.vm.utmValue = newUtmValue;

    await customWrapper.vm.$nextTick();

    expect(customWrapper.emitted('update:model-value')).toBeTruthy();
    const emittedValue = customWrapper.emitted('update:model-value')[0][0];
    expect(emittedValue.config.filter.utm).toBe(newUtmValue);
    expect(emittedValue.config.orders.icon).toBe('local_activity');
    expect(emittedValue.config.total_value.icon).toBe('currency_exchange');
    expect(emittedValue.config.average_ticket.icon).toBe('sell');
  });

  it('calls updateUtm and emits the correct update:model-value event', () => {
    const customWrapper = createWrapper({
      type: 'vtex_order',
      config: {
        filter: {
          utm: 'initial_utm',
        },
      },
    });

    const newUtmValue = 'updated_utm_value';

    customWrapper.vm.updateUtm(newUtmValue);

    expect(customWrapper.emitted('update:model-value')).toBeTruthy();

    const emittedValue = customWrapper.emitted('update:model-value')[0][0];

    expect(emittedValue.config.filter.utm).toBe(newUtmValue);

    expect(emittedValue.config.orders.icon).toBe('local_activity');
    expect(emittedValue.config.total_value.icon).toBe('currency_exchange');
    expect(emittedValue.config.average_ticket.icon).toBe('sell');

    expect(emittedValue.type).toBe('vtex_order');
  });

  it('renders UnnnicLabel with the correct label', () => {
    const labelComponent = wrapper.findComponent({ name: 'UnnnicLabel' });

    expect(labelComponent.exists()).toBe(true);

    expect(labelComponent.props('label')).toBe('UTM');
  });

  it('renders UnnnicInput and updates utmValue correctly', async () => {
    const inputComponent = wrapper
      .findComponent({ name: 'UnnnicInput' })
      .findComponent('input');

    expect(inputComponent.exists()).toBe(true);

    expect(inputComponent.props('modelValue')).toBe('test_utm');

    await inputComponent.setValue('updated_utm_value');

    expect(wrapper.emitted('update:model-value')).toBeTruthy();
    const emittedValue = wrapper.emitted('update:model-value')[0][0];
    expect(emittedValue.config.filter.utm).toBe('updated_utm_value');
  });
});
