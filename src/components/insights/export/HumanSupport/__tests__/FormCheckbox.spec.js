import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import FormCheckbox from '../FormCheckbox.vue';

const mockStore = {
  model_fields: { value: {} },
  selected_fields: { value: {} },
  enabled_models: { value: [] },
  sectors: { value: [] },
  queues: { value: [] },
  agents: { value: [] },
  tags: { value: [] },
  setModelFields: vi.fn(),
  updateModelFieldSelection: vi.fn(),
  toggleModelEnabled: vi.fn(),
};

vi.mock('@/store/modules/export/humanSupport/export', () => ({
  useHumanSupportExport: () => mockStore,
}));

vi.mock('@/services/api/resources/export/humanSupport/export', () => ({
  default: {
    getModelFields: vi.fn().mockResolvedValue({
      rooms: { field1: { type: 'string' } },
      users: { field2: { type: 'number' } },
    }),
  },
}));

vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    storeToRefs: (store) => store,
  };
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
});

config.global.plugins = [i18n];

describe('HumanSupport FormCheckbox', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    Object.assign(mockStore, storeOverrides);

    return mount(FormCheckbox, {
      global: {
        stubs: {
          ExportCheckboxs: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    Object.assign(mockStore, {
      model_fields: { value: {} },
      selected_fields: { value: {} },
      enabled_models: { value: [] },
      sectors: { value: [] },
      queues: { value: [] },
      agents: { value: [] },
      tags: { value: [] },
    });

    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render ExportCheckboxs component', () => {
      const component = wrapper.find(
        '[data-testid="human-support-form-checkbox"]',
      );
      expect(component.exists()).toBe(true);
    });
  });

  describe('Lifecycle hooks', () => {
    it('should fetch model fields on mounted', async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockStore.setModelFields).toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation();
      const exportService = await import(
        '@/services/api/resources/export/humanSupport/export'
      );
      exportService.default.getModelFields.mockRejectedValueOnce(
        new Error('Fetch error'),
      );

      wrapper = createWrapper();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Computed properties', () => {
    it('should compute modelFilters with correct structure', () => {
      wrapper = createWrapper({
        sectors: { value: [{ value: '1', label: 'Sector 1' }] },
        queues: { value: [{ value: '2', label: 'Queue 1' }] },
        agents: { value: [{ value: '3', label: 'Agent 1' }] },
        tags: { value: [{ value: '4', label: 'Tag 1' }] },
      });

      const filters = wrapper.vm.modelFilters;
      expect(filters).toHaveLength(4);
      expect(filters[0].modelName).toBe('sectors');
      expect(filters[1].modelName).toBe('queues');
      expect(filters[2].modelName).toBe('users');
      expect(filters[3].modelName).toBe('sector_tags');
    });

    it('should use empty arrays when no filters', () => {
      const filters = wrapper.vm.modelFilters;
      expect(filters[0].filterData).toEqual([]);
    });
  });

  describe('Event handlers', () => {
    it('should handle model toggle', () => {
      wrapper.vm.handleModelToggle('rooms', true);
      expect(mockStore.toggleModelEnabled).toHaveBeenCalledWith('rooms', true);
    });

    it('should handle field toggle', () => {
      wrapper.vm.handleFieldToggle('rooms', 'field1', true);
      expect(mockStore.updateModelFieldSelection).toHaveBeenCalledWith(
        'rooms',
        'field1',
        true,
      );
    });
  });

  describe('Loading state', () => {
    it('should start with isLoading false', () => {
      expect(wrapper.vm.isLoading).toBe(false);
    });
  });

  describe('Component structure', () => {
    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
