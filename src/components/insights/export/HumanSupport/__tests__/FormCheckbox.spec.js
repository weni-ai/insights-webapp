import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { isRef, ref } from 'vue';

import FormCheckbox from '../FormCheckbox.vue';

const modelFields = ref({});
const selectedFields = ref({});
const enabledModels = ref([]);
const sectors = ref([]);
const queues = ref([]);
const agents = ref([]);
const tags = ref([]);

const mockStore = {
  model_fields: modelFields,
  selected_fields: selectedFields,
  enabled_models: enabledModels,
  sectors,
  queues,
  agents,
  tags,
  setModelFields: vi.fn(),
  updateModelFieldSelection: vi.fn(),
  toggleModelEnabled: vi.fn(),
};

const resolveOverrideValue = (store, key, value) => {
  if (
    isRef(store[key]) &&
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === 1 &&
    Object.prototype.hasOwnProperty.call(value, 'value')
  ) {
    return value.value;
  }

  return value;
};

const applyStoreOverrides = (store, overrides = {}) => {
  Object.entries(overrides).forEach(([key, value]) => {
    const resolved = resolveOverrideValue(store, key, value);

    if (isRef(store[key])) {
      store[key].value = resolved;
      return;
    }

    store[key] = resolved;
  });
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

describe('HumanSupport FormCheckbox', () => {
  let wrapper;

  const createWrapper = (storeOverrides = {}) => {
    applyStoreOverrides(mockStore, storeOverrides);

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

    modelFields.value = {};
    selectedFields.value = {};
    enabledModels.value = [];
    sectors.value = [];
    queues.value = [];
    agents.value = [];
    tags.value = [];

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
      await flushPromises();
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
      await flushPromises();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Computed properties', () => {
    it('should compute modelFilters with correct structure', () => {
      wrapper = createWrapper({
        sectors: [{ value: '1', label: 'Sector 1' }],
        queues: [{ value: '2', label: 'Queue 1' }],
        agents: [{ value: '3', label: 'Agent 1' }],
        tags: [{ value: '4', label: 'Tag 1' }],
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
