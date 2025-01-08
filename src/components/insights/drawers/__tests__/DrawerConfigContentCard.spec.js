import { flushPromises, shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStore } from 'vuex';

import DrawerConfigContentCard from '../DrawerConfigContentCard.vue';

describe('DrawerConfigContentCard', () => {
  let wrapper;
  let mockStore;
  let store;

  beforeEach(() => {
    mockStore = {
      actions: { 'widgets/updateCurrentWidgetEditingConfig': vi.fn() },
    };
    store = createStore({
      modules: {
        widgets: {
          namespaced: true,
          state: {
            currentWidgetEditing: {
              config: {
                name: 'Test Widget',
                friendly_id: 'emoji-id',
              },
            },
          },
        },
      },
      actions: mockStore.actions,
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

  it('updates Vuex store when config changes', async () => {
    wrapper.vm.config.name = 'Updated Widget Name';
    expect(
      mockStore.actions['widgets/updateCurrentWidgetEditingConfig'],
    ).toHaveBeenCalled();
  });

  it('disables reset button when widgetConfig is empty', async () => {
    wrapper.vm.$store.state.widgets.currentWidgetEditing.config = {};

    await wrapper.vm.$forceUpdate();

    const resetButton = wrapper.findComponent(
      '[data-testid="reset-widget-button"]',
    );
    expect(resetButton.attributes('disabled')).toBe('true');
  });

  it('emits update-disable-primary-button change values', async () => {
    wrapper.vm.$store.state.widgets.currentWidgetEditing.config.name =
      'Initial Name';

    await flushPromises();

    expect(wrapper.emitted('update-disable-primary-button')).toBeTruthy();
  });
});
