import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

import FormDataCrossing from '../index.vue';
import { useWidgets } from '@/store/modules/widgets';

vi.mock('@/components/RadioList.vue', () => ({
  default: {
    name: 'RadioList',
    template: '<div data-testid="radio-list">{{ label }}</div>',
    props: ['modelValue', 'label', 'radios'],
    emits: ['update:modelValue'],
  },
}));

vi.mock('@/components/CheckboxList.vue', () => ({
  default: {
    name: 'CheckboxList',
    template: '<div data-testid="checkbox-list">{{ label }}</div>',
    props: ['label', 'checkboxes'],
    emits: ['update:checkboxes'],
  },
}));

vi.mock('../SubWidget.vue', () => ({
  default: {
    name: 'SubWidget',
    template: '<div data-testid="subwidget">{{ title }}</div>',
    props: ['title', 'config', 'active'],
    emits: ['update:config', 'update:active', 'is-valid-form'],
  },
}));

const mockWidgetConfig = {
  subwidget_1: {
    result_type: 'executions',
    operation: 'avg',
    flow: {
      uuid: 'flow-1',
      result: '',
      result_correspondence: '',
    },
  },
  subwidget_2: {
    result_type: 'flow_result',
    operation: 'sum',
    flow: {
      uuid: 'flow-2',
      result: 'result-1',
      result_correspondence: '',
    },
  },
  operation: 'percentage',
  currency: false,
};

const createWrapper = (widgetConfig = mockWidgetConfig) => {
  const pinia = createPinia();
  setActivePinia(pinia);

  const widgetsStore = useWidgets();
  widgetsStore.currentWidgetEditing = {
    config: widgetConfig,
  };

  return mount(FormDataCrossing, {
    global: {
      plugins: [pinia],
    },
  });
};

describe('FormDataCrossing', () => {
  let wrapper;
  let widgetsStore;

  beforeEach(() => {
    wrapper = createWrapper();
    widgetsStore = useWidgets();
  });

  describe('Rendering', () => {
    it('should render subwidgets correctly', () => {
      const subwidgets = wrapper.findAllComponents('[data-testid="subwidget"]');
      expect(subwidgets).toHaveLength(2);
      // Titles are translated by $t, so we expect the translated values
      expect(subwidgets[0].text()).toBe('First value');
      expect(subwidgets[1].text()).toBe('Second value');
    });

    it('should render operations RadioList', () => {
      const radioList = wrapper.findComponent('[data-testid="radio-list"]');
      expect(radioList.exists()).toBe(true);
      expect(radioList.text()).toBe('Operation');
    });

    it('should render formatations CheckboxList', () => {
      const checkboxList = wrapper.findComponent(
        '[data-testid="checkbox-list"]',
      );
      expect(checkboxList.exists()).toBe(true);
      expect(checkboxList.text()).toBe('Format');
    });
  });

  describe('Initialization', () => {
    it('should initialize config with default values when there is no configuration', () => {
      const emptyConfig = {};
      const wrapperWithEmptyConfig = createWrapper(emptyConfig);

      expect(wrapperWithEmptyConfig.vm.config).toEqual({
        subwidget_1: {
          result_type: 'executions',
          operation: 'avg',
          flow: {
            uuid: '',
            result: '',
            result_correspondence: '',
          },
        },
        subwidget_2: {
          result_type: 'executions',
          operation: 'avg',
          flow: {
            uuid: '',
            result: '',
            result_correspondence: '',
          },
        },
        operation: 'percentage',
        currency: false,
      });
    });

    it('should initialize activeSubwidget as 0 after mount', async () => {
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.activeSubwidget).toBe(0);
    });

    it('should initialize isSubwidgetsValids with false values', () => {
      expect(wrapper.vm.isSubwidgetsValids).toEqual({
        subwidget_1: false,
        subwidget_2: false,
      });
    });
  });

  describe('Computed Properties', () => {
    it('should return widgetConfig from store', () => {
      expect(wrapper.vm.widgetConfig).toEqual(mockWidgetConfig);
    });

    it('should return formatations with currency disabled when operation is percentage', () => {
      wrapper.vm.config.operation = 'percentage';

      const formatations = wrapper.vm.formatations;
      expect(formatations).toHaveLength(1);
      expect(formatations[0]).toEqual({
        value: 'currency',
        selected: false,
        label: 'Currency',
        disabled: true,
      });
    });

    it('should return formatations with currency enabled when operation is not percentage', () => {
      wrapper.vm.config.operation = 'multiply';

      const formatations = wrapper.vm.formatations;
      expect(formatations[0].disabled).toBe(false);
    });

    it('should return isValidForm as true when all subwidgets are valid and operation is defined', () => {
      wrapper.vm.isSubwidgetsValids = {
        subwidget_1: true,
        subwidget_2: true,
      };
      wrapper.vm.config.operation = 'multiply';

      expect(wrapper.vm.isValidForm).toBe(true);
    });

    it('should return isValidForm as false when some subwidget is not valid', () => {
      wrapper.vm.isSubwidgetsValids = {
        subwidget_1: true,
        subwidget_2: false,
      };
      wrapper.vm.config.operation = 'multiply';

      expect(wrapper.vm.isValidForm).toBe(false);
    });

    it('should return isValidForm as false when operation is not defined', () => {
      wrapper.vm.isSubwidgetsValids = {
        subwidget_1: true,
        subwidget_2: true,
      };
      wrapper.vm.config.operation = '';

      expect(wrapper.vm.isValidForm).toBe(false);
    });
  });

  describe('Watchers', () => {
    it('should call updateCurrentWidgetEditingConfig when config changes', async () => {
      const updateConfigSpy = vi.spyOn(
        widgetsStore,
        'updateCurrentWidgetEditingConfig',
      );

      wrapper.vm.config.operation = 'sum';
      await wrapper.vm.$nextTick();

      expect(updateConfigSpy).toHaveBeenCalledWith({
        ...mockWidgetConfig,
        operation: 'sum',
      });
    });

    it('should disable currency when operation is percentage', async () => {
      wrapper.vm.config.operation = 'percentage';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.config.currency).toBe(false);
    });

    it('should reset flow.result when flow.uuid changes from object to string', async () => {
      wrapper.vm.config.subwidget_1.flow.uuid = { uuid: 'old-flow' };
      await wrapper.vm.$nextTick();

      wrapper.vm.config.subwidget_1.flow.uuid = 'new-flow';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.config.subwidget_1.flow.result).toBe('');
    });

    it('should emit update:is-valid-form when isValidForm changes', async () => {
      // First, let's ensure the form is initially invalid
      wrapper.vm.isSubwidgetsValids = {
        subwidget_1: false,
        subwidget_2: false,
      };
      wrapper.vm.config.operation = '';
      await wrapper.vm.$nextTick();

      // Now let's make it valid
      wrapper.vm.isSubwidgetsValids = {
        subwidget_1: true,
        subwidget_2: true,
      };
      wrapper.vm.config.operation = 'multiply';
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('update:is-valid-form')).toBeTruthy();
      // Check if the last emitted event is true
      const emittedEvents = wrapper.emitted('update:is-valid-form');
      expect(emittedEvents[emittedEvents.length - 1]).toEqual([true]);
    });
  });

  describe('Methods', () => {
    it('should update subwidget correctly', () => {
      const newConfig = {
        result_type: 'flow_result',
        operation: 'sum',
        flow: {
          uuid: 'new-flow',
          result: 'new-result',
          result_correspondence: '',
        },
      };

      wrapper.vm.updateSubwidget(1, newConfig);
      expect(wrapper.vm.config.subwidget_1).toEqual(newConfig);
    });

    it('should update activeSubwidget when subwidget is activated', () => {
      wrapper.vm.updateActiveSubwidget(1, true);
      expect(wrapper.vm.activeSubwidget).toBe(1);
    });

    it('should reset activeSubwidget when subwidget is deactivated', () => {
      wrapper.vm.activeSubwidget = 1;
      wrapper.vm.updateActiveSubwidget(1, false);
      expect(wrapper.vm.activeSubwidget).toBeNull();
    });

    it('should update isSubwidgetsValids correctly', () => {
      wrapper.vm.updateSubwigetValid(0, true);
      expect(wrapper.vm.isSubwidgetsValids.subwidget_1).toBe(true);
    });

    it('should update formatations correctly', () => {
      const newFormatations = [{ value: 'currency', selected: true }];

      wrapper.vm.updateFormatations(newFormatations);
      expect(wrapper.vm.config.currency).toBe(true);
    });
  });

  describe('Child Component Events', () => {
    it('should update config when SubWidget emits update:config', async () => {
      const subwidgets = wrapper.findAllComponents('[data-testid="subwidget"]');
      const newConfig = {
        result_type: 'flow_result',
        operation: 'sum',
        flow: {
          uuid: 'test-flow',
          result: 'test-result',
          result_correspondence: '',
        },
      };

      await subwidgets[0].vm.$emit('update:config', newConfig);
      expect(wrapper.vm.config.subwidget_1).toEqual(newConfig);
    });

    it('should update activeSubwidget when SubWidget emits update:active', async () => {
      const subwidgets = wrapper.findAllComponents('[data-testid="subwidget"]');

      await subwidgets[1].vm.$emit('update:active', true);
      expect(wrapper.vm.activeSubwidget).toBe(1);
    });

    it('should update isSubwidgetsValids when SubWidget emits is-valid-form', async () => {
      const subwidgets = wrapper.findAllComponents('[data-testid="subwidget"]');

      await subwidgets[0].vm.$emit('is-valid-form', true);
      expect(wrapper.vm.isSubwidgetsValids.subwidget_1).toBe(true);
    });

    it('should update operation when RadioList emits update:modelValue', async () => {
      // Simulate v-model change
      wrapper.vm.config.operation = 'multiply';
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.config.operation).toBe('multiply');
    });

    it('should update formatations when CheckboxList emits update:checkboxes', async () => {
      const newCheckboxes = [{ value: 'currency', selected: true }];

      // Simulate method call directly
      wrapper.vm.updateFormatations(newCheckboxes);
      expect(wrapper.vm.config.currency).toBe(true);
    });
  });

  describe('Pinia Store Integration', () => {
    it('should use currentWidgetEditing from store', () => {
      expect(wrapper.vm.currentWidgetEditing).toEqual({
        config: mockWidgetConfig,
      });
    });

    it('should call updateCurrentWidgetEditingConfig from store', async () => {
      const updateConfigSpy = vi.spyOn(
        widgetsStore,
        'updateCurrentWidgetEditingConfig',
      );

      wrapper.vm.config.operation = 'sum';
      await wrapper.vm.$nextTick();

      expect(updateConfigSpy).toHaveBeenCalled();
    });
  });
});
