import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';

import FilterSelect from '../FilterSelect.vue';
import Projects from '@/services/api/resources/projects';

vi.mock('@/services/api/resources/projects');

const i18n = createI18n({ legacy: false });
config.global.plugins = [i18n];

const mockApiResponse = {
  results: [
    { uuid: '1', name: 'Agent 1', email: 'agent1@test.com' },
    { uuid: '2', name: 'Agent 2' },
  ],
  next: 'http://api.com/next',
};

const mockContactResponse = {
  results: [
    { uuid: 'c1', name: 'Contact 1', external_id: 'ext1' },
    { uuid: 'c2', name: 'Contact 2' },
  ],
  next: 'http://api.com/next',
};

const createWrapper = (props = {}, options = {}) => {
  const wrapper = mount(FilterSelect, {
    props: {
      type: 'attendant',
      source: 'agents',
      modelValue: [],
      ...props,
    },
    global: {
      stubs: {
        UnnnicSelectSmart: {
          template: '<div data-testid="mock-select-smart"></div>',
          props: ['modelValue', 'options', 'isLoading'],
          methods: {
            finishInfiniteScroll: vi.fn(),
          },
        },
        UnnnicLabel: true,
      },
      mocks: {
        $t: (key) => key,
      },
    },
    ...options,
  });

  // Mock the selectSmartRef
  if (wrapper.vm.selectSmartRef) {
    wrapper.vm.selectSmartRef = {
      finishInfiniteScroll: vi.fn(),
    };
  }

  return wrapper;
};

describe('FilterSelect', () => {
  let wrapper;

  const getFilterSelect = (type) =>
    wrapper.find(`[data-testid="filter-select-${type}"]`);

  beforeEach(() => {
    vi.clearAllMocks();
    Projects.getProjectSource = vi.fn().mockResolvedValue(mockApiResponse);
    Projects.getProjectSourcePaginated = vi
      .fn()
      .mockResolvedValue(mockApiResponse);
  });

  describe('Component Rendering', () => {
    it('should render attendant filter', async () => {
      wrapper = createWrapper();
      await nextTick();

      expect(getFilterSelect('attendant').exists()).toBe(true);
    });

    it('should render contact filter with infinite scroll props', async () => {
      wrapper = createWrapper({ type: 'contact', source: 'contacts' });
      await nextTick();

      expect(getFilterSelect('contact').exists()).toBe(true);
    });

    it('should render ticket_id filter', async () => {
      wrapper = createWrapper({ type: 'ticket_id', source: 'ticket_id' });
      await nextTick();

      expect(getFilterSelect('ticket_id').exists()).toBe(true);
    });
  });

  describe('Data Loading', () => {
    it('should load data on mount', async () => {
      wrapper = createWrapper();
      await nextTick();

      expect(Projects.getProjectSource).toHaveBeenCalledWith(
        'agents',
        {},
        false,
      );
    });

    it('should handle array response', async () => {
      Projects.getProjectSource = vi
        .fn()
        .mockResolvedValue([{ uuid: '1', name: 'Agent 1' }]);
      wrapper = createWrapper();
      await nextTick();

      expect(wrapper.vm.data).toEqual([{ uuid: '1', name: 'Agent 1' }]);
      expect(wrapper.vm.nextPageUrl).toBeNull();
    });

    it('should handle paginated response with infinite scroll', async () => {
      Projects.getProjectSource = vi
        .fn()
        .mockResolvedValue(mockContactResponse);
      wrapper = createWrapper({ type: 'contact', source: 'contacts' });
      await nextTick();

      expect(wrapper.vm.data).toEqual(mockContactResponse.results);
      expect(wrapper.vm.nextPageUrl).toBe('http://api.com/next');
    });

    it('should handle API error', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      Projects.getProjectSource = vi
        .fn()
        .mockRejectedValue(new Error('API Error'));

      wrapper = createWrapper();
      await nextTick();

      expect(wrapper.vm.data).toEqual([]);
      expect(wrapper.vm.nextPageUrl).toBeNull();
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Filter Selection', () => {
    beforeEach(async () => {
      Projects.getProjectSource = vi.fn().mockResolvedValue(mockApiResponse);
      wrapper = createWrapper();
      await nextTick();
    });

    it('should emit change event when option is selected', async () => {
      wrapper.vm.handleChange([{ value: '1', label: 'Agent 1' }]);
      await nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('change')).toBeTruthy();
    });

    it('should emit clear event when selection is cleared', async () => {
      wrapper = createWrapper({
        modelValue: [{ value: '1', label: 'Agent 1' }],
      });
      await nextTick();

      wrapper.vm.handleChange([]);
      await nextTick();

      expect(wrapper.emitted('update:modelValue')[0]).toEqual([[]]);
      expect(wrapper.emitted('change')[0]).toEqual([{ value: '', label: '' }]);
    });

    it('should handle attendant selection with email', async () => {
      wrapper.vm.handleChange([{ value: '1', label: 'Agent 1' }]);
      await nextTick();

      const emitted = wrapper.emitted('change')[0][0];
      expect(emitted.email).toBe('agent1@test.com');
    });

    it('should handle contact with external_id', async () => {
      Projects.getProjectSource = vi
        .fn()
        .mockResolvedValue(mockContactResponse);
      wrapper = createWrapper({ type: 'contact', source: 'contacts' });
      await nextTick();

      wrapper.vm.handleChange([{ value: 'ext1', label: 'Contact 1' }]);
      await nextTick();

      expect(wrapper.emitted('change')[0][0].value).toBe('ext1');
    });

    it('should not emit if same value is selected', async () => {
      wrapper = createWrapper({
        modelValue: [{ value: '1', label: 'Agent 1' }],
      });
      await nextTick();

      const emitCountBefore = wrapper.emitted('change')?.length || 0;
      wrapper.vm.handleChange([{ value: '1', label: 'Agent 1' }]);
      await nextTick();

      const emitCountAfter = wrapper.emitted('change')?.length || 0;
      expect(emitCountAfter).toBe(emitCountBefore);
    });
  });

  describe('Infinite Scroll', () => {
    beforeEach(async () => {
      Projects.getProjectSource = vi
        .fn()
        .mockResolvedValue(mockContactResponse);
      wrapper = createWrapper({ type: 'contact', source: 'contacts' });

      wrapper.vm.selectSmartRef = {
        finishInfiniteScroll: vi.fn(),
      };

      await nextTick();
    });

    it('should have infinite scroll enabled for contact filter', () => {
      expect(wrapper.vm.hasInfiniteScroll).toBe(true);
      expect(wrapper.vm.canLoadMore()).toBe(true);
    });

    it('should load more data when scroll ends', async () => {
      Projects.getProjectSourcePaginated = vi.fn().mockResolvedValue({
        results: [{ uuid: 'c3', name: 'Contact 3' }],
        next: null,
      });

      await wrapper.vm.loadMoreData();
      await nextTick();

      expect(Projects.getProjectSourcePaginated).toHaveBeenCalledWith(
        'http://api.com/next',
      );
      expect(wrapper.vm.data.length).toBe(3);
    });

    it('should not load more data when already loading', async () => {
      wrapper.vm.isLoadingMore = true;

      await wrapper.vm.loadMoreData();

      expect(Projects.getProjectSourcePaginated).not.toHaveBeenCalled();
    });

    it('should finish infinite scroll on error', async () => {
      Projects.getProjectSourcePaginated = vi
        .fn()
        .mockRejectedValue(new Error('Load more error'));
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await wrapper.vm.loadMoreData();
      await nextTick();

      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      Projects.getProjectSource = vi
        .fn()
        .mockResolvedValue(mockContactResponse);
      wrapper = createWrapper({ type: 'contact', source: 'contacts' });
      await nextTick();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce search input', async () => {
      wrapper.vm.handleSearchValueUpdate('test search');

      expect(Projects.getProjectSource).toHaveBeenCalledTimes(1); // Initial load

      vi.advanceTimersByTime(500);
      await nextTick();

      expect(Projects.getProjectSource).toHaveBeenCalledTimes(2);
      expect(Projects.getProjectSource).toHaveBeenLastCalledWith(
        'contacts',
        expect.objectContaining({ search: 'test search' }),
        true,
      );
    });

    it('should cancel previous search timer on new input', async () => {
      wrapper.vm.handleSearchValueUpdate('first');
      vi.advanceTimersByTime(300);

      wrapper.vm.handleSearchValueUpdate('second');
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(Projects.getProjectSource).toHaveBeenCalledWith(
        'contacts',
        expect.objectContaining({ search: 'second' }),
        true,
      );
    });

    it('should not search when value matches existing label', async () => {
      wrapper.vm.handleSearchValueUpdate('Contact 1');

      vi.advanceTimersByTime(500);
      await nextTick();

      expect(Projects.getProjectSource).toHaveBeenCalledTimes(1); // Only initial
    });

    it('should reload data when search is cleared', async () => {
      wrapper.vm.handleSearchValueUpdate('');
      await nextTick();

      expect(Projects.getProjectSource).toHaveBeenCalled();
    });

    it('should not search for attendant filter', () => {
      wrapper = createWrapper();
      const callCount = Projects.getProjectSource.mock.calls.length;

      wrapper.vm.handleSearchValueUpdate('test');
      vi.advanceTimersByTime(500);

      expect(Projects.getProjectSource).toHaveBeenCalledTimes(callCount);
    });
  });

  describe('Filter Parameters Watch', () => {
    it('should reload data when filterParams change', async () => {
      wrapper = createWrapper({ filterParams: { sectors: ['s1'] } });
      await nextTick();

      const initialCalls = Projects.getProjectSource.mock.calls.length;

      await wrapper.setProps({ filterParams: { sectors: ['s2'] } });
      await nextTick();

      expect(Projects.getProjectSource.mock.calls.length).toBeGreaterThan(
        initialCalls,
      );
    });
  });

  describe('Cleanup', () => {
    it('should clear timer on unmount', async () => {
      vi.useFakeTimers();
      wrapper = createWrapper({ type: 'contact', source: 'contacts' });
      await nextTick();

      wrapper.vm.handleSearchValueUpdate('test');

      wrapper.unmount();

      expect(wrapper.vm.searchDebounceTimer).toBeNull();
      vi.useRealTimers();
    });
  });

  describe('Exposed Methods', () => {
    beforeEach(async () => {
      Projects.getProjectSource = vi
        .fn()
        .mockResolvedValue(mockContactResponse);
      wrapper = createWrapper({ type: 'contact', source: 'contacts' });
      await nextTick();
    });

    it('should expose loadData method', async () => {
      const initialLength = Projects.getProjectSource.mock.calls.length;

      await wrapper.vm.loadData();

      expect(Projects.getProjectSource.mock.calls.length).toBeGreaterThan(
        initialLength,
      );
    });

    it('should expose clearData method', async () => {
      wrapper.vm.data = mockContactResponse.results;
      wrapper.vm.nextPageUrl = 'http://api.com/next';

      wrapper.vm.clearData();

      expect(wrapper.vm.data).toEqual([]);
      expect(wrapper.vm.nextPageUrl).toBeNull();
      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    });
  });
});
