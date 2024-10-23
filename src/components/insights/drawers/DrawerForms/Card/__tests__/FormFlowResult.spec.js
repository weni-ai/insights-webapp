import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import FormFlowResult from '@/components/insights/drawers/DrawerForms/Card/FormFlowResult.vue';

const createDefaultStore = (config = {}) => {
  return createStore({
    modules: {
      widgets: {
        namespaced: true,
        state: {
          currentWidgetEditing: {
            config: {
              flow: {
                uuid: '',
                result: '',
              },
              operation: '',
              currency: false,
              ...config,
            },
          },
        },
        actions: {
          updateCurrentWidgetEditingConfig: vi.fn(),
        },
      },
    },
  });
};

const createWrapper = (store = createDefaultStore()) => {
  return mount(FormFlowResult, {
    global: {
      plugins: [store],
      stubs: {
        SelectFlow: true,
        SelectFlowResult: true,
        RadioList: true,
        UnnnicLabel: true,
        UnnnicCheckbox: true,
      },
      mocks: {
        $t: (key) => key,
      },
    },
  });
};

describe('FormFlowResult', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = createDefaultStore();
    wrapper = createWrapper(store);
  });

  describe('Component Initialization', () => {
    it('renders successfully', () => {
      expect(wrapper.exists()).toBeTruthy();
    });

    it('initializes with correct components', () => {
      expect(
        wrapper.findComponent('[data-test-id="select-flow"]').exists(),
      ).toBeTruthy();
      expect(
        wrapper.findComponent('[data-test-id="select-flow-result"]').exists(),
      ).toBeTruthy();
      expect(
        wrapper.findComponent('[data-test-id="radio-list"]').exists(),
      ).toBeTruthy();
      expect(
        wrapper.findComponent('[data-test-id="label"]').exists(),
      ).toBeTruthy();
      expect(
        wrapper.findComponent('[data-test-id="check-box"]').exists(),
      ).toBeTruthy();
    });

    it('initializes with correct default values', () => {
      expect(wrapper.vm.config).toEqual({
        flow: {
          uuid: '',
          result: '',
        },
        operation: '',
        currency: false,
      });
    });

    it('initializes with correct operations list', () => {
      const operations = wrapper.vm.operations;
      expect(operations).toHaveLength(5);
      expect(operations.map((op) => op.value)).toEqual([
        'sum',
        'max',
        'avg',
        'min',
        'recurrence',
      ]);
      operations.forEach((op) => {
        expect(op).toHaveProperty('label');
        expect(op).toHaveProperty('value');
      });
    });
  });

  describe('Props and Emits', () => {
    it('emits update:is-valid-form when form validity changes', async () => {
      expect(wrapper.emitted('update:is-valid-form')?.[1][0]).toBe('');

      await wrapper.setData({
        config: {
          flow: {
            uuid: 'test-uuid',
            result: 'test-result',
          },
          operation: 'sum',
          currency: false,
        },
      });

      await wrapper.vm.$nextTick();
      const emitted = wrapper.emitted('update:is-valid-form');
      expect(emitted[emitted.length - 1][0]).toBe('sum');
    });
  });

  describe('Computed Properties', () => {
    it('computes isValidForm correctly when form is invalid', () => {
      expect(wrapper.vm.isValidForm).toBe('');
    });

    it('computes isValidForm correctly when form is valid', async () => {
      await wrapper.setData({
        config: {
          flow: {
            uuid: 'test-uuid',
            result: 'test-result',
          },
          operation: 'sum',
          currency: false,
        },
      });

      await wrapper.vm.$nextTick();
      expect(wrapper.vm.isValidForm).toBe('sum');
    });
  });

  describe('Watchers', () => {
    it('watches config changes and dispatches updateCurrentWidgetEditingConfig', async () => {
      const updateAction = vi.fn();
      const customStore = createStore({
        modules: {
          widgets: {
            namespaced: true,
            state: {
              currentWidgetEditing: {
                config: {
                  flow: { uuid: '', result: '' },
                  operation: '',
                  currency: false,
                },
              },
            },
            actions: {
              updateCurrentWidgetEditingConfig: updateAction,
            },
          },
        },
      });

      const wrapperWithCustomStore = createWrapper(customStore);
      await wrapperWithCustomStore.setData({
        config: {
          flow: {
            uuid: 'new-uuid',
            result: 'new-result',
          },
          operation: 'sum',
          currency: true,
        },
      });

      expect(updateAction).toHaveBeenCalled();
    });

    it('disables currency when operation is recurrence', async () => {
      await wrapper.setData({
        config: {
          flow: {
            uuid: 'test-uuid',
            result: 'test-result',
          },
          operation: 'recurrence',
          currency: true,
        },
      });

      await wrapper.vm.$nextTick();
      expect(wrapper.vm.config.currency).toBe(false);
    });

    it('resets flow result when flow uuid changes', async () => {
      const initialConfig = {
        flow: {
          uuid: {
            id: 'store-uuid',
          },
          result: 'test-result',
        },
        operation: 'sum',
        currency: true,
      };

      const storeWithConfig = createDefaultStore(initialConfig);
      const wrapperWithStore = createWrapper(storeWithConfig);

      expect(wrapperWithStore.vm.config.flow.result).toBe('');
    });
  });

  describe('Component Interactions', () => {
    it('handles SelectFlow value changes', async () => {
      const selectFlow = wrapper.findComponent('[data-test-id="select-flow"]');
      await selectFlow.vm.$emit('update:modelValue', 'new-uuid');

      expect(wrapper.vm.config.flow.uuid).toBe('new-uuid');
    });

    it('handles SelectFlowResult value changes', async () => {
      const selectFlowResult = wrapper.findComponent(
        '[data-test-id="select-flow-result"]',
      );
      await selectFlowResult.vm.$emit('update:modelValue', 'new-result');

      expect(wrapper.vm.config.flow.result).toBe('new-result');
    });

    it('handles RadioList operation selection', async () => {
      const radioList = wrapper.findComponent('[data-test-id="radio-list"]');
      await radioList.vm.$emit('update:selected-radio', 'max');

      expect(wrapper.vm.config.operation).toBe('max');
    });

    it('handles UnnnicCheckbox currency changes', async () => {
      const checkbox = wrapper.findComponent('[data-test-id="check-box"]');
      await checkbox.vm.$emit('change', true);

      expect(wrapper.vm.config.currency).toBe(true);
    });

    it('disables SelectFlowResult when no flow uuid is selected', () => {
      const selectFlowResult = wrapper.findComponent(
        '[data-test-id="select-flow-result"]',
      );
      console.log('selectFlowResult ', selectFlowResult.html());
      expect(selectFlowResult.attributes('disabled')).toBe('true');
    });

    it('enables SelectFlowResult when flow uuid is selected', async () => {
      await wrapper.setData({
        config: {
          flow: {
            uuid: 'test-uuid',
            result: '',
          },
          operation: '',
          currency: false,
        },
      });

      const selectFlowResult = wrapper.findComponent(
        '[data-test-id="select-flow-result"]',
      );
      expect(selectFlowResult.attributes('disabled')).toBe('false');
    });
  });

  describe('Store Integration', () => {
    it('initializes with store config values', async () => {
      const initialConfig = {
        flow: {
          uuid: 'store-uuid',
          result: '',
        },
        operation: 'sum',
        currency: true,
      };

      const storeWithConfig = createDefaultStore(initialConfig);
      const wrapperWithStore = createWrapper(storeWithConfig);
      expect(wrapperWithStore.vm.config).toEqual(initialConfig);
    });

    it('updates store when config changes', async () => {
      const updateAction = vi.fn();
      const customStore = createStore({
        modules: {
          widgets: {
            namespaced: true,
            state: {
              currentWidgetEditing: {
                config: {
                  flow: { uuid: '', result: '' },
                  operation: '',
                  currency: false,
                },
              },
            },
            actions: {
              updateCurrentWidgetEditingConfig: updateAction,
            },
          },
        },
      });

      const wrapperWithCustomStore = createWrapper(customStore);
      const newConfig = {
        flow: {
          uuid: 'updated-uuid',
          result: 'updated-result',
        },
        operation: 'max',
        currency: true,
      };

      await wrapperWithCustomStore.setData({ config: newConfig });
      expect(updateAction).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining(newConfig),
      );
    });
  });
});
