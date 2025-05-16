import { flushPromises, shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { createTestingPinia } from '@pinia/testing';

import DrawerConfigContentCard from '../DrawerConfigContentCard.vue';
import { useWidgets } from '@/store/modules/widgets';

describe('DrawerConfigContentCard', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = createTestingPinia({
      initialState: {
        widgets: {
          currentWidgetEditing: {
            config: {
              name: 'Test Widget',
              friendly_id: 'emoji-id',
            },
          },
          updateCurrentWidgetEditingConfig: vi.fn(),
        },
      },
    });

    wrapper = shallowMount(DrawerConfigContentCard, {
      props: { type: 'executions' },
      global: {
        plugins: [store],
      },
    });
  });

  it('renders the correct form component based on type', async () => {
    expect(
      wrapper.findComponent('[data-testid="form-executions"]').exists(),
    ).toBe(true);

    await wrapper.setProps({ type: 'flow_result' });
    expect(
      wrapper.findComponent('[data-testid="form-flow_result"]').exists(),
    ).toBe(true);

    await wrapper.setProps({ type: 'data_crossing' });
    expect(
      wrapper.findComponent('[data-testid="form-data_crossing"]').exists(),
    ).toBe(true);
  });

  it('emits the "reset-widget" event on button click', async () => {
    const resetButton = wrapper.findComponent(
      '[data-testid="reset-widget-button"]',
    );
    await resetButton.trigger('click');

    expect(wrapper.emitted('reset-widget')).toBeTruthy();
  });

  it('updates pinia store when config changes', async () => {
    const widgetsStore = useWidgets();
    wrapper.vm.config.name = 'Updated Widget Name';
    expect(widgetsStore.updateCurrentWidgetEditingConfig).toHaveBeenCalled();
  });

  it('disables reset button when widgetConfig is empty', async () => {
    const widgetsStore = useWidgets();
    widgetsStore.currentWidgetEditing.config = {};

    await wrapper.vm.$forceUpdate();

    const resetButton = wrapper.findComponent(
      '[data-testid="reset-widget-button"]',
    );
    expect(resetButton.attributes('disabled')).toBe('true');
  });

  it('emits update-disable-primary-button change values', async () => {
    const widgetsStore = useWidgets();
    widgetsStore.currentWidgetEditing.config.name = 'Initial Name';

    await flushPromises();

    expect(wrapper.emitted('update-disable-primary-button')).toBeTruthy();
  });
});
