import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import FormExecutions from '@/components/insights/drawers/DrawerForms/Card/FormExecutions.vue';

const widgetConfigMock = {
  flow: {
    uuid: 'test-uuid',
  },
};

const store = createStore({
  modules: {
    widgets: {
      namespaced: true,
      state: {
        currentWidgetEditing: {
          config: widgetConfigMock,
        },
      },
      actions: {
        updateCurrentWidgetEditingConfig: vi.fn(),
      },
    },
  },
});

const createWrapper = (customStore = store) => {
  return mount(FormExecutions, {
    global: {
      plugins: [customStore],
      stubs: {
        SelectFlow: true,
      },
    },
  });
};

describe('FormExecutions', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  describe('Component Initialization', () => {
    it('should mount component correctly', () => {
      expect(wrapper.vm).toBeTruthy();

      const selectFlow = wrapper.findComponent({ name: 'SelectFlow' });

      expect(selectFlow.attributes().modelvalue).toBe('test-uuid');
      expect(selectFlow.exists()).toBeTruthy();
    });

    it('should initialize config with widgetConfig data', () => {
      expect(wrapper.vm.config).toEqual({
        flow: {
          uuid: 'test-uuid',
        },
      });
    });

    it('should initialize config with empty uuid when no widgetConfig flow uuid exists', () => {
      const customStore = createStore({
        modules: {
          widgets: {
            namespaced: true,
            state: {
              currentWidgetEditing: {
                config: {},
              },
            },
            actions: {
              updateCurrentWidgetEditingConfig: vi.fn(),
            },
          },
        },
      });

      const customWrapper = createWrapper(customStore);

      expect(customWrapper.vm.config).toEqual({
        flow: {
          uuid: '',
        },
      });
    });
  });

  describe('Computed Properties', () => {
    it('should compute isValidForm as true when flow uuid exists', () => {
      expect(wrapper.vm.isValidForm).toBeTruthy();
    });

    it('should compute isValidForm as false when flow uuid is empty', async () => {
      await wrapper.setData({
        config: {
          flow: {
            uuid: '',
          },
        },
      });
      expect(wrapper.vm.isValidForm).toBeFalsy();
    });

    it('should compute isValidForm as false when config is null', async () => {
      await wrapper.setData({
        config: {
          flow: {
            uuid: null,
          },
        },
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.isValidForm).toBeFalsy();
    });
  });

  describe('Watchers', () => {
    it('should emit update:is-valid-form when isValidForm changes', async () => {
      await wrapper.setData({
        config: {
          flow: {
            uuid: '',
          },
        },
      });

      expect(wrapper.emitted('update:is-valid-form')).toBeTruthy();
      expect(wrapper.emitted('update:is-valid-form')).toContainEqual([false]);
    });

    it('should call updateCurrentWidgetEditingConfig when config changes', async () => {
      const updateSpy = vi.spyOn(
        wrapper.vm,
        'updateCurrentWidgetEditingConfig',
      );

      await wrapper.setData({
        config: {
          flow: {
            uuid: 'new-uuid',
          },
        },
      });

      expect(updateSpy).toHaveBeenCalledWith({
        flow: {
          uuid: 'new-uuid',
        },
      });
    });
  });

  describe('Props and Events', () => {
    it('should update SelectFlow v-model when config.flow.uuid changes', async () => {
      const selectFlow = wrapper.findComponent({ name: 'SelectFlow' });
      expect(selectFlow.props('modelValue')).toBe('test-uuid');

      await wrapper.setData({
        config: {
          flow: {
            uuid: 'new-uuid',
          },
        },
      });

      expect(selectFlow.props('modelValue')).toBe('new-uuid');
    });

    it('should emit initial isValidForm state on mount', async () => {
      expect(wrapper.emitted('update:is-valid-form')).toBeTruthy();
      expect(wrapper.emitted('update:is-valid-form')[0]).toEqual([false]);

      await wrapper.setData({
        config: {
          flow: {
            uuid: 'new-uuid',
          },
        },
      });

      expect(wrapper.emitted('update:is-valid-form')[1]).toEqual([true]);
    });

    it('should compute isValidForm as false when flow uuid is undefined', async () => {
      await wrapper.setData({
        config: {
          flow: {
            uuid: undefined,
          },
        },
      });
      expect(wrapper.vm.isValidForm).toBeFalsy();
    });
  });

  describe('Store Integration', () => {
    it('should correctly map widgetConfig from store state', () => {
      expect(wrapper.vm.widgetConfig).toEqual(widgetConfigMock);
    });

    it('should correctly map and call updateCurrentWidgetEditingConfig action', async () => {
      const mockStore = createStore({
        modules: {
          widgets: {
            namespaced: true,
            state: {
              currentWidgetEditing: {
                config: widgetConfigMock,
              },
            },
            actions: {
              updateCurrentWidgetEditingConfig: vi.fn(),
            },
          },
        },
      });

      const spyAction = vi.spyOn(
        mockStore._actions['widgets/updateCurrentWidgetEditingConfig'],
        '0',
      );

      const customWrapper = createWrapper(mockStore);

      await customWrapper.setData({
        config: {
          flow: {
            uuid: 'new-uuid',
          },
        },
      });

      expect(spyAction).toHaveBeenCalled();
      expect(spyAction).toHaveBeenCalledWith({
        flow: {
          uuid: 'new-uuid',
        },
      });
    });
  });
});
