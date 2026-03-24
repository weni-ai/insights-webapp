import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';

import FilterMultiSelect from '../FilterMultiSelect.vue';
import Projects from '@/services/api/resources/projects';

vi.mock('@/services/api/resources/projects');

const i18n = createI18n({ legacy: false });
config.global.plugins = [i18n];

const mockApiResponse = [
  { name: 'Custom Status 1' },
  { name: 'Custom Status 2' },
  { name: 'Custom Status 3' },
];

const createWrapper = (props = {}) => {
  return mount(FilterMultiSelect, {
    props: {
      type: 'status',
      label: 'Status',
      source: 'custom_status',
      itemValue: 'name',
      itemLabel: 'name',
      modelValue: [],
      ...props,
    },
    global: {
      stubs: {
        UnnnicMultiSelect: {
          template: '<div></div>',
          inheritAttrs: true,
          props: [
            'modelValue',
            'options',
            'search',
            'enableSearch',
            'clearable',
            'label',
            'placeholder',
          ],
        },
      },
      mocks: {
        $t: (key) => key,
      },
    },
  });
};

describe('FilterMultiSelect', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    Projects.getProjectSource = vi.fn().mockResolvedValue(mockApiResponse);
  });

  describe('Component Rendering', () => {
    it('should render the multi-select component', () => {
      wrapper = createWrapper();

      expect(wrapper.find('.filter-multi-select').exists()).toBe(true);
    });

    it('should render UnnnicMultiSelect with correct data-testid', () => {
      wrapper = createWrapper({ type: 'status' });

      expect(
        wrapper.find('[data-testid="detailed-filters-select-status"]').exists(),
      ).toBe(true);
    });

    it('should compute the correct filter label', () => {
      wrapper = createWrapper({ type: 'status' });

      expect(wrapper.vm.filterLabel).toBe(
        'human_support_dashboard.filters.status.label',
      );
    });

    it('should compute filter label based on type prop', () => {
      wrapper = createWrapper({ type: 'attendant' });

      expect(wrapper.vm.filterLabel).toBe(
        'human_support_dashboard.filters.attendant.label',
      );
    });
  });

  describe('Data Loading', () => {
    it('should load options on mount', async () => {
      wrapper = createWrapper();
      await nextTick();

      expect(Projects.getProjectSource).toHaveBeenCalledWith('custom_status');
    });

    it('should map API response to options format', async () => {
      wrapper = createWrapper();
      await nextTick();

      expect(wrapper.vm.loadedOptions).toEqual([
        { value: 'Custom Status 1', label: 'Custom Status 1' },
        { value: 'Custom Status 2', label: 'Custom Status 2' },
        { value: 'Custom Status 3', label: 'Custom Status 3' },
      ]);
    });

    it('should map using itemValue and itemLabel props', async () => {
      const response = [
        { id: '1', displayName: 'Status A' },
        { id: '2', displayName: 'Status B' },
      ];
      Projects.getProjectSource = vi.fn().mockResolvedValue(response);

      wrapper = createWrapper({ itemValue: 'id', itemLabel: 'displayName' });
      await nextTick();

      expect(wrapper.vm.loadedOptions).toEqual([
        { value: '1', label: 'Status A' },
        { value: '2', label: 'Status B' },
      ]);
    });

    it('should handle API error gracefully', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      Projects.getProjectSource = vi
        .fn()
        .mockRejectedValue(new Error('API Error'));

      wrapper = createWrapper();
      await nextTick();

      expect(wrapper.vm.loadedOptions).toEqual([]);
      expect(consoleError).toHaveBeenCalledWith(
        'Error loading options',
        expect.any(Error),
      );
      consoleError.mockRestore();
    });

    it('should handle empty API response', async () => {
      Projects.getProjectSource = vi.fn().mockResolvedValue([]);

      wrapper = createWrapper();
      await nextTick();

      expect(wrapper.vm.loadedOptions).toEqual([]);
    });
  });

  describe('Options Computed', () => {
    it('should include static online and offline options alongside loaded options', async () => {
      wrapper = createWrapper();
      await nextTick();

      const options = wrapper.vm.options;

      expect(options[0]).toEqual({ value: 'online', label: 'Online' });
      expect(options[options.length - 1]).toEqual({
        value: 'offline',
        label: 'Offline',
      });
    });

    it('should place loaded options between online and offline', async () => {
      wrapper = createWrapper();
      await nextTick();

      const options = wrapper.vm.options;

      expect(options).toHaveLength(mockApiResponse.length + 2);
      expect(options[1]).toEqual({
        value: 'Custom Status 1',
        label: 'Custom Status 1',
      });
      expect(options[2]).toEqual({
        value: 'Custom Status 2',
        label: 'Custom Status 2',
      });
      expect(options[3]).toEqual({
        value: 'Custom Status 3',
        label: 'Custom Status 3',
      });
    });

    it('should only have online and offline when no options are loaded', async () => {
      Projects.getProjectSource = vi.fn().mockResolvedValue([]);

      wrapper = createWrapper();
      await nextTick();

      expect(wrapper.vm.options).toEqual([
        { value: 'online', label: 'Online' },
        { value: 'offline', label: 'Offline' },
      ]);
    });
  });

  describe('Search Functionality', () => {
    it('should initialize search value as empty string', () => {
      wrapper = createWrapper();

      expect(wrapper.vm.searchValue).toBe('');
    });

    it('should update search value when setSearchValue is called', () => {
      wrapper = createWrapper();

      wrapper.vm.setSearchValue('test search');

      expect(wrapper.vm.searchValue).toBe('test search');
    });

    it('should clear search value when setSearchValue receives empty string', () => {
      wrapper = createWrapper();

      wrapper.vm.setSearchValue('some text');
      expect(wrapper.vm.searchValue).toBe('some text');

      wrapper.vm.setSearchValue('');
      expect(wrapper.vm.searchValue).toBe('');
    });
  });

  describe('Model Value Changes', () => {
    it('should emit change event when modelValue updates', async () => {
      wrapper = createWrapper({ modelValue: [] });
      await nextTick();

      await wrapper.setProps({ modelValue: ['Custom Status 1'] });
      await nextTick();

      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0]).toEqual([
        { value: ['Custom Status 1'], label: '' },
      ]);
    });

    it('should emit change with multiple selected values', async () => {
      wrapper = createWrapper({ modelValue: [] });
      await nextTick();

      await wrapper.setProps({
        modelValue: ['Custom Status 1', 'Custom Status 2'],
      });
      await nextTick();

      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0]).toEqual([
        { value: ['Custom Status 1', 'Custom Status 2'], label: '' },
      ]);
    });

    it('should emit change when modelValue is cleared', async () => {
      wrapper = createWrapper({ modelValue: ['Custom Status 1'] });
      await nextTick();

      await wrapper.setProps({ modelValue: [] });
      await nextTick();

      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0]).toEqual([{ value: [], label: '' }]);
    });
  });
});
