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
    it('renders UnnnicSelectSmart component correctly', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      expect(selectComponent.exists()).toBeTruthy();
    });

    it('passes correct props to UnnnicSelectSmart', () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      expect(selectComponent.props('multiple')).toBe(true);
      expect(selectComponent.props('autocomplete')).toBe(true);
      expect(selectComponent.props('autocompleteIconLeft')).toBe(true);
      expect(selectComponent.props('autocompleteClearOnFocus')).toBe(true);
    });

    it('initializes with correct default props', () => {
      expect(wrapper.props()).toEqual({
        modelValue: [],
        placeholder: 'Select options',
        source: 'test-source',
        dependsOn: undefined,
        dependsOnValue: null,
        keyValueField: '',
      });
    });
  });

  describe('Data initialization', () => {
    it('sets initial options with placeholder', async () => {
      // Wait for component to be fully mounted
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.options[0]).toEqual({
        value: '',
        label: 'Select options',
      });
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
      expect(wrapper.vm.options).toHaveLength(4); // placeholder + 3 sources
    });

    it('does not fetch source data on mount when dependsOn is provided', async () => {
      Projects.getProjectSource.mockClear();

      const customWrapper = createWrapper({
        dependsOn: { search_param: 'test' },
      });

      await customWrapper.vm.$nextTick();

      expect(Projects.getProjectSource).not.toHaveBeenCalled();
    });

    it('adds fetched sources to options correctly', async () => {
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.options).toEqual([
        {
          value: '',
          label: 'Select options',
        },
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

      expect(customWrapper.vm.options[1]).toEqual({
        value: 'c1',
        label: 'Custom 1',
      });
      expect(customWrapper.vm.options[2]).toEqual({
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

      expect(customWrapper.vm.options[1]).toEqual({
        value: 'uuid1',
        label: 'Source 1',
      });
    });

    it('handles empty response from getProjectSource', async () => {
      Projects.getProjectSource.mockResolvedValue(null);
      const customWrapper = createWrapper();

      await customWrapper.vm.$nextTick();

      expect(customWrapper.vm.options).toEqual([
        {
          value: '',
          label: 'Select options',
        },
      ]);
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
      expect(customWrapper.vm.options).toEqual([
        {
          value: '',
          label: 'Select options',
        },
      ]);

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

      // First, populate options
      await customWrapper.vm.$nextTick();
      customWrapper.vm.options = [
        { value: '', label: 'Select options' },
        { value: '1', label: 'Source 1' },
      ];

      Projects.getProjectSource.mockClear();

      await customWrapper.setProps({
        dependsOnValue: { param1: 'value1', param2: 'value2' },
      });

      // Should clear options first, then fetch new data
      expect(customWrapper.vm.options).toEqual([
        { value: '', label: 'Select options' },
        { value: '1', label: 'Source 1' },
        { value: '2', label: 'Source 2' },
        { value: '3', label: 'Source 3' },
      ]);
    });
  });

  describe('Methods', () => {
    it('clears options correctly', () => {
      wrapper.vm.options = [
        { value: '', label: 'Select options' },
        { value: '1', label: 'Source 1' },
        { value: '2', label: 'Source 2' },
      ];

      wrapper.vm.clearOptions();

      expect(wrapper.vm.options).toEqual([
        {
          value: '',
          label: 'Select options',
        },
      ]);
    });

    it('emits update:model-value when updateModelValue is called', async () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      const newValue = ['1', '2'];

      await selectComponent.vm.$emit('update:model-value', newValue);

      expect(wrapper.emitted('update:model-value')).toBeTruthy();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([newValue]);
    });
  });

  describe('Component interaction', () => {
    it('emits update:model-value when UnnnicSelectSmart value changes', async () => {
      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      const newValue = ['1', '3'];

      await selectComponent.vm.$emit('update:model-value', newValue);

      expect(wrapper.emitted('update:model-value')).toBeTruthy();
      expect(wrapper.emitted('update:model-value')[0]).toEqual([newValue]);
    });

    it('passes treatedModelValue to UnnnicSelectSmart', async () => {
      const customWrapper = createWrapper({
        modelValue: ['1', '2'],
      });

      const selectComponent = customWrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      expect(selectComponent.props('modelValue')).toEqual(['1', '2']);
    });

    it('passes options to UnnnicSelectSmart', async () => {
      await wrapper.vm.$nextTick();

      const selectComponent = wrapper.findComponent(
        '[data-testid="unnnic-multi-select"]',
      );
      expect(selectComponent.props('options')).toEqual([
        {
          value: '',
          label: 'Select options',
        },
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
});
