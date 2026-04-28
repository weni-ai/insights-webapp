import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import FilterMultiSelect from '@/components/insights/Layout/HeaderFilters/FilterMultiSelect.vue';
import Projects from '@/services/api/resources/projects';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    getProjectSource: vi.fn(),
  },
}));

const mockSourceData = [
  { uuid: '1', name: 'Source 1' },
  { uuid: '2', name: 'Source 2' },
  { uuid: '3', name: 'Source 3' },
];

const createWrapper = (props = {}) => {
  const pinia = createTestingPinia({
    initialState: {
      sectors: {
        sectors: [],
      },
    },
  });

  return mount(FilterMultiSelect, {
    props: {
      modelValue: [],
      placeholder: 'Select options',
      source: 'test-source',
      keyValueField: '',
      ...props,
    },
    global: {
      plugins: [pinia],
    },
  });
};

describe('FilterMultiSelect', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    Projects.getProjectSource.mockResolvedValue(mockSourceData);
    wrapper = createWrapper();
  });

  describe('Rendering', () => {
    it('renders UnnnicMultiSelect component correctly', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      expect(selectComponent.exists()).toBeTruthy();
    });

    it('passes correct props to UnnnicMultiSelect', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      expect(selectComponent.props('enableSearch')).toBe(true);
      expect(selectComponent.props('returnObject')).toBe(true);
    });

    it('initializes with correct default props', () => {
      expect(wrapper.props()).toEqual({
        modelValue: [],
        placeholder: 'Select options',
        source: 'test-source',
        dependsOn: undefined,
        dependsOnValue: null,
        keyValueField: '',
        allLabel: '',
        disabled: false,
      });
    });
  });

  describe('Data initialization', () => {
    it('initializes with empty options', async () => {
      const freshWrapper = createWrapper();
      expect(freshWrapper.vm.options).toEqual([]);
    });

    it('computes treatedModelValue correctly when modelValue is provided', () => {
      const customWrapper = createWrapper({
        modelValue: ['1', '2'],
      });
      expect(customWrapper.vm.treatedModelValue).toEqual(['1', '2']);
    });

    it('computes treatedModelValue correctly when modelValue is null/undefined', () => {
      const customWrapper = createWrapper({
        modelValue: null,
      });
      expect(customWrapper.vm.treatedModelValue).toEqual([]);
    });
  });

  describe('Source data fetching', () => {
    it('fetches source data on mount when no dependsOn is provided', async () => {
      expect(Projects.getProjectSource).toHaveBeenCalledWith('test-source', {});
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.options).toHaveLength(3);
    });

    it('does not fetch source data on mount when dependsOn is provided', async () => {
      Projects.getProjectSource.mockClear();

      const customWrapper = createWrapper({
        dependsOn: { search_param: 'test' },
      });

      await customWrapper.vm.$nextTick();

      expect(Projects.getProjectSource).not.toHaveBeenCalled();
    });

    it('does not fetch source data on mount when dependsOnValue is provided', async () => {
      Projects.getProjectSource.mockClear();

      createWrapper({
        dependsOnValue: { sector_id: 'some-uuid' },
      });

      await vi.waitFor(() => {
        expect(Projects.getProjectSource).toHaveBeenCalledTimes(1);
      });

      expect(Projects.getProjectSource).toHaveBeenCalledWith('test-source', {
        sector_id: 'some-uuid',
      });
    });

    it('adds fetched sources to options correctly', async () => {
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.options).toEqual([
        {
          value: '1',
          label: 'Source 1',
        },
        {
          value: '2',
          label: 'Source 2',
        },
        {
          value: '3',
          label: 'Source 3',
        },
      ]);
    });

    it('handles custom keyValueField properly', async () => {
      const customSourceData = [
        { custom_id: 'c1', name: 'Custom 1' },
        { custom_id: 'c2', name: 'Custom 2' },
      ];
      Projects.getProjectSource.mockResolvedValue(customSourceData);

      const customWrapper = createWrapper({
        keyValueField: 'custom_id',
      });

      await customWrapper.vm.$nextTick();

      expect(customWrapper.vm.options[0]).toEqual({
        value: 'c1',
        label: 'Custom 1',
      });
      expect(customWrapper.vm.options[1]).toEqual({
        value: 'c2',
        label: 'Custom 2',
      });
    });

    it('falls back to uuid when keyValueField is not found', async () => {
      const customSourceData = [
        { uuid: 'uuid1', name: 'Source 1' },
        { uuid: 'uuid2', name: 'Source 2' },
      ];
      Projects.getProjectSource.mockResolvedValue(customSourceData);

      const customWrapper = createWrapper({
        keyValueField: 'non_existent_field',
      });

      await customWrapper.vm.$nextTick();

      expect(customWrapper.vm.options[0]).toEqual({
        value: 'uuid1',
        label: 'Source 1',
      });
    });

    it('handles empty response from getProjectSource', async () => {
      Projects.getProjectSource.mockResolvedValue(null);
      const customWrapper = createWrapper();

      await customWrapper.vm.$nextTick();

      expect(customWrapper.vm.options).toEqual([]);
    });

    it('handles error from getProjectSource gracefully', async () => {
      Projects.getProjectSource.mockRejectedValue(new Error('API Error'));
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const customWrapper = createWrapper();

      await customWrapper.vm.$nextTick();

      expect(consoleSpy).toHaveBeenCalledWith(
        'getProjectSource error',
        expect.any(Error),
      );
      expect(customWrapper.vm.options).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('Dependency handling', () => {
    it('watches dependsOnValue and fetches new data when all values are filled', async () => {
      const customWrapper = createWrapper({
        dependsOn: { search_param: 'test' },
        dependsOnValue: { param1: 'value1' },
      });

      Projects.getProjectSource.mockClear();

      await customWrapper.setProps({
        dependsOnValue: { param1: 'value1', param2: 'value2' },
      });

      expect(Projects.getProjectSource).toHaveBeenCalledWith('test-source', {
        param1: 'value1',
        param2: 'value2',
      });
    });

    it('does not fetch new data when dependsOnValue changes but not all values are filled', async () => {
      const customWrapper = createWrapper({
        dependsOn: { search_param: 'test' },
        dependsOnValue: { param1: 'value1' },
      });

      Projects.getProjectSource.mockClear();

      await customWrapper.setProps({
        dependsOnValue: { param1: 'value1', param2: '' },
      });

      expect(Projects.getProjectSource).not.toHaveBeenCalled();
    });

    it('does not fetch new data when dependsOnValue changes but contains null values', async () => {
      const customWrapper = createWrapper({
        dependsOn: { search_param: 'test' },
        dependsOnValue: { param1: 'value1' },
      });

      Projects.getProjectSource.mockClear();

      await customWrapper.setProps({
        dependsOnValue: { param1: 'value1', param2: null },
      });

      expect(Projects.getProjectSource).not.toHaveBeenCalled();
    });

    it('clears options before fetching new data when dependency changes', async () => {
      const customWrapper = createWrapper({
        dependsOn: { search_param: 'test' },
        dependsOnValue: { param1: 'value1' },
      });

      await customWrapper.vm.$nextTick();
      customWrapper.vm.options = [{ value: '1', label: 'Source 1' }];

      Projects.getProjectSource.mockClear();

      await customWrapper.setProps({
        dependsOnValue: { param1: 'value1', param2: 'value2' },
      });

      expect(customWrapper.vm.options).toEqual([
        { value: '1', label: 'Source 1' },
        { value: '2', label: 'Source 2' },
        { value: '3', label: 'Source 3' },
      ]);
    });
  });

  describe('Methods', () => {
    it('clears options correctly', () => {
      wrapper.vm.options = [
        { value: '1', label: 'Source 1' },
        { value: '2', label: 'Source 2' },
      ];

      wrapper.vm.clearOptions();

      expect(wrapper.vm.options).toEqual([]);
    });

    it('emits update:model-value when updateModelValue is called', async () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      const newValue = [
        { value: '1', label: 'Source 1' },
        { value: '2', label: 'Source 2' },
      ];

      await selectComponent.vm.$emit('update:modelValue', newValue);

      expect(wrapper.emitted('update:model-value')).toBeTruthy();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([newValue]);
    });
  });

  describe('Component interaction', () => {
    it('emits update:model-value when UnnnicMultiSelect value changes', async () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      const newValue = [
        { value: '1', label: 'Source 1' },
        { value: '3', label: 'Source 3' },
      ];

      await selectComponent.vm.$emit('update:modelValue', newValue);

      expect(wrapper.emitted('update:model-value')).toBeTruthy();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([newValue]);
    });

    it('passes treatedModelValue to UnnnicMultiSelect', async () => {
      const customWrapper = createWrapper({
        modelValue: [
          { value: '1', label: 'Source 1' },
          { value: '2', label: 'Source 2' },
        ],
      });

      const selectComponent = customWrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      expect(selectComponent.props('modelValue')).toEqual([
        { value: '1', label: 'Source 1' },
        { value: '2', label: 'Source 2' },
      ]);
    });

    it('passes options to UnnnicMultiSelect', async () => {
      await wrapper.vm.$nextTick();

      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      expect(selectComponent.props('options')).toEqual([
        {
          value: '1',
          label: 'Source 1',
        },
        {
          value: '2',
          label: 'Source 2',
        },
        {
          value: '3',
          label: 'Source 3',
        },
      ]);
    });
  });

  describe('All option handling', () => {
    it('adds __all__ option when allLabel is provided and options exist', async () => {
      const customWrapper = createWrapper({
        allLabel: 'All items',
      });

      await customWrapper.vm.$nextTick();

      expect(customWrapper.vm.optionsWithAll[0]).toEqual({
        value: '__all__',
        label: 'All items',
      });
    });

    it('does not add __all__ option when allLabel is empty', async () => {
      await wrapper.vm.$nextTick();

      const hasAll = wrapper.vm.optionsWithAll.some(
        (opt) => opt.value === '__all__',
      );
      expect(hasAll).toBe(false);
    });

    it('keeps only __all__ when selecting __all__ while others are selected', () => {
      const customWrapper = createWrapper({
        allLabel: 'All items',
        modelValue: [{ value: '1', label: 'Source 1' }],
      });

      const newValue = [
        { value: '1', label: 'Source 1' },
        { value: '__all__', label: 'All items' },
      ];

      customWrapper.vm.updateModelValue(newValue);

      expect(customWrapper.emitted('update:model-value')[0]).toEqual([
        [{ value: '__all__', label: 'All items' }],
      ]);
    });

    it('keeps __all__ when selecting specific option while __all__ was selected', () => {
      const customWrapper = createWrapper({
        allLabel: 'All items',
        modelValue: [{ value: '__all__', label: 'All items' }],
      });

      const newValue = [
        { value: '__all__', label: 'All items' },
        { value: '1', label: 'Source 1' },
      ];

      customWrapper.vm.updateModelValue(newValue);

      expect(customWrapper.emitted('update:model-value')[0]).toEqual([
        [{ value: '__all__', label: 'All items' }],
      ]);
    });
  });
});
