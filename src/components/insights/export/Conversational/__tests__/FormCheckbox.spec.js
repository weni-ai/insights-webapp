import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';

import FormCheckbox from '../FormCheckbox.vue';

const mockStore = {
  model_fields: { value: {} },
  selected_fields: { value: {} },
  enabled_models: { value: [] },
  custom_widgets: { value: [] },
  updateModelFieldSelection: vi.fn(),
  toggleModelEnabled: vi.fn(),
  initializeDefaultFields: vi.fn(),
};

vi.mock('@/store/modules/export/conversational/export', () => ({
  useConversationalExport: () => mockStore,
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

describe('Conversational FormCheckbox', () => {
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
      custom_widgets: { value: [] },
    });

    wrapper = createWrapper();
  });

  describe('Component rendering', () => {
    it('should render ExportCheckboxs component', () => {
      const component = wrapper.find(
        '[data-testid="conversational-form-checkbox"]',
      );
      expect(component.exists()).toBe(true);
    });
  });

  describe('Lifecycle hooks', () => {
    it('should initialize fields on mounted', () => {
      expect(mockStore.initializeDefaultFields).toHaveBeenCalled();
    });

    it('should handle initialization errors', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation();
      mockStore.initializeDefaultFields.mockImplementation(() => {
        throw new Error('Init error');
      });

      wrapper = createWrapper();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Widget translation', () => {
    it('should translate widget UUID to display name', () => {
      wrapper = createWrapper({
        custom_widgets: {
          value: [
            { uuid: '123-456', name: 'Widget A' },
            { uuid: '789-abc', name: 'Widget B' },
          ],
        },
        model_fields: {
          value: { '123-456': { field1: {} }, '789-abc': { field2: {} } },
        },
      });

      const translated = wrapper.vm.translatedModelFields;
      expect(translated['Widget A']).toBeDefined();
      expect(translated['Widget B']).toBeDefined();
      expect(translated['123-456']).toBeUndefined();
    });

    it('should handle duplicate widget names', () => {
      wrapper = createWrapper({
        custom_widgets: {
          value: [
            { uuid: '12345678-1234', name: 'Widget' },
            { uuid: '87654321-4321', name: 'Widget' },
          ],
        },
        model_fields: {
          value: {
            '12345678-1234': { field1: {} },
            '87654321-4321': { field2: {} },
          },
        },
      });

      const translated = wrapper.vm.translatedModelFields;
      expect(translated['Widget (12345678)']).toBeDefined();
      expect(translated['Widget (87654321)']).toBeDefined();
    });
  });

  describe('Event handlers', () => {
    it('should handle model toggle with display name', () => {
      wrapper = createWrapper({
        custom_widgets: {
          value: [{ uuid: '123-456', name: 'Widget A' }],
        },
      });

      wrapper.vm.handleModelToggle('Widget A', true);
      expect(mockStore.toggleModelEnabled).toHaveBeenCalledWith(
        '123-456',
        true,
      );
    });

    it('should handle field toggle with display name', () => {
      wrapper = createWrapper({
        custom_widgets: {
          value: [{ uuid: '123-456', name: 'Widget A' }],
        },
      });

      wrapper.vm.handleFieldToggle('Widget A', 'field1', true);
      expect(mockStore.updateModelFieldSelection).toHaveBeenCalledWith(
        '123-456',
        'field1',
        true,
      );
    });

    it('should handle model toggle with UUID format', () => {
      wrapper = createWrapper({
        custom_widgets: {
          value: [{ uuid: '12345678-1234', name: 'Widget' }],
        },
      });

      wrapper.vm.handleModelToggle('Widget (12345678)', true);
      expect(mockStore.toggleModelEnabled).toHaveBeenCalledWith(
        '12345678-1234',
        true,
      );
    });
  });

  describe('Computed properties', () => {
    it('should compute modelFilters as empty array', () => {
      expect(wrapper.vm.modelFilters).toEqual([]);
    });

    it('should translate enabled models', () => {
      wrapper = createWrapper({
        custom_widgets: {
          value: [{ uuid: '123-456', name: 'Widget A' }],
        },
        enabled_models: { value: ['123-456'] },
      });

      expect(wrapper.vm.translatedEnabledModels).toEqual(['Widget A']);
    });

    it('should translate selected fields', () => {
      wrapper = createWrapper({
        custom_widgets: {
          value: [{ uuid: '123-456', name: 'Widget A' }],
        },
        selected_fields: { value: { '123-456': ['field1'] } },
      });

      const translated = wrapper.vm.translatedSelectedFields;
      expect(translated['Widget A']).toEqual(['field1']);
      expect(translated['123-456']).toBeUndefined();
    });
  });

  describe('Component structure', () => {
    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
