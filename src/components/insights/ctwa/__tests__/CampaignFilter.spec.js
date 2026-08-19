import { beforeEach, describe, expect, it, vi } from 'vitest';
import { config, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createI18n } from 'vue-i18n';

import CampaignFilter from '../CampaignFilter.vue';
import Projects from '@/services/api/resources/projects';

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    getMetaCampaigns: vi.fn(),
  },
}));

const PAGE_SIZE = 20;

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      ctwa_dashboard: {
        filters: {
          campaign: {
            placeholder: 'All campaigns',
          },
        },
      },
    },
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

const mockCampaignsResponse = {
  results: [
    { uuid: 'uuid-1', name: 'Campaign 1' },
    { uuid: 'uuid-2', name: 'Campaign 2' },
  ],
  count: 3,
};

const createWrapper = (props = {}) =>
  mount(CampaignFilter, {
    props: {
      modelValue: '',
      ...props,
    },
    global: {
      stubs: {
        UnnnicSelect: {
          template: '<div data-testid="ctwa-campaign-filter"></div>',
          props: [
            'modelValue',
            'options',
            'search',
            'enableSearch',
            'placeholder',
            'clearable',
            'infiniteScroll',
            'infiniteScrollCanLoadMore',
          ],
          methods: {
            finishInfiniteScroll: vi.fn(),
          },
        },
      },
    },
  });

describe('CampaignFilter', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    Projects.getMetaCampaigns.mockResolvedValue(mockCampaignsResponse);
  });

  describe('Component rendering', () => {
    it('renders the campaign select', async () => {
      wrapper = createWrapper();
      await nextTick();

      expect(
        wrapper.find('[data-testid="ctwa-campaign-filter"]').exists(),
      ).toBe(true);
    });
  });

  describe('Data loading', () => {
    it('loads campaigns on mount', async () => {
      wrapper = createWrapper();
      await nextTick();

      expect(Projects.getMetaCampaigns).toHaveBeenCalledWith({
        limit: PAGE_SIZE,
        offset: 0,
      });
    });

    it('maps campaign results to select options', async () => {
      wrapper = createWrapper();
      await nextTick();
      await nextTick();

      expect(wrapper.vm.options).toEqual([
        { value: 'uuid-1', label: 'Campaign 1' },
        { value: 'uuid-2', label: 'Campaign 2' },
      ]);
    });

    it('keeps selected campaign in options when it is not in the loaded results', async () => {
      wrapper = createWrapper({ modelValue: 'selected-uuid' });
      await nextTick();
      await nextTick();

      expect(wrapper.vm.options[0]).toEqual({
        value: 'selected-uuid',
        label: 'selected-uuid',
      });
    });

    it('resets options when the request fails', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      Projects.getMetaCampaigns.mockRejectedValueOnce(new Error('fail'));
      wrapper = createWrapper();
      await nextTick();
      await nextTick();

      expect(wrapper.vm.options).toEqual([]);
      consoleError.mockRestore();
    });
  });

  describe('Selection', () => {
    it('emits the campaign uuid when an option is selected', async () => {
      wrapper = createWrapper();
      await nextTick();

      wrapper.vm.handleChange('uuid-1');

      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['uuid-1']);
    });

    it('emits an empty value when the selection is cleared', async () => {
      wrapper = createWrapper({ modelValue: 'uuid-1' });
      await nextTick();

      wrapper.vm.handleChange('');

      expect(wrapper.emitted('update:modelValue')[0]).toEqual(['']);
    });

    it('does not emit when the same campaign is selected again', async () => {
      wrapper = createWrapper({ modelValue: 'uuid-1' });
      await nextTick();

      wrapper.vm.handleChange('uuid-1');

      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    });
  });

  describe('Search', () => {
    it('fetches campaigns by name after debounce', async () => {
      vi.useFakeTimers();
      wrapper = createWrapper();
      await nextTick();
      Projects.getMetaCampaigns.mockClear();

      wrapper.vm.handleSearchUpdate('Bulk');
      vi.advanceTimersByTime(500);
      await nextTick();

      expect(Projects.getMetaCampaigns).toHaveBeenCalledWith({
        search: 'Bulk',
        limit: PAGE_SIZE,
        offset: 0,
      });
      vi.useRealTimers();
    });

    it('reloads campaigns without search when the search is cleared', async () => {
      vi.useFakeTimers();
      wrapper = createWrapper();
      await nextTick();

      wrapper.vm.handleSearchUpdate('Bulk');
      vi.advanceTimersByTime(500);
      await nextTick();
      Projects.getMetaCampaigns.mockClear();

      wrapper.vm.handleSearchUpdate('');
      await nextTick();

      expect(Projects.getMetaCampaigns).toHaveBeenCalledWith({
        limit: PAGE_SIZE,
        offset: 0,
      });
      vi.useRealTimers();
    });

    it('does not refetch when the search value does not change', async () => {
      wrapper = createWrapper();
      await nextTick();
      Projects.getMetaCampaigns.mockClear();

      wrapper.vm.handleSearchUpdate('');

      expect(Projects.getMetaCampaigns).not.toHaveBeenCalled();
    });

    it('does not search when the term matches a selected label', async () => {
      wrapper = createWrapper();
      await nextTick();
      await nextTick();
      Projects.getMetaCampaigns.mockClear();

      wrapper.vm.handleSearchUpdate('Campaign 1');

      expect(Projects.getMetaCampaigns).not.toHaveBeenCalled();
    });
  });

  describe('Infinite scroll', () => {
    it('loads the next page with limit and offset and appends results', async () => {
      wrapper = createWrapper();
      await nextTick();
      await nextTick();

      Projects.getMetaCampaigns.mockResolvedValueOnce({
        results: [{ uuid: 'uuid-3', name: 'Campaign 3' }],
        count: 3,
      });

      await wrapper.vm.loadMoreData();

      expect(Projects.getMetaCampaigns).toHaveBeenCalledWith({
        limit: PAGE_SIZE,
        offset: PAGE_SIZE,
      });
      expect(wrapper.vm.options).toEqual([
        { value: 'uuid-1', label: 'Campaign 1' },
        { value: 'uuid-2', label: 'Campaign 2' },
        { value: 'uuid-3', label: 'Campaign 3' },
      ]);
    });

    it('keeps the search term when loading the next page', async () => {
      vi.useFakeTimers();
      wrapper = createWrapper();
      await nextTick();

      wrapper.vm.handleSearchUpdate('Bulk');
      vi.advanceTimersByTime(500);
      await nextTick();
      await nextTick();

      Projects.getMetaCampaigns.mockClear();
      Projects.getMetaCampaigns.mockResolvedValueOnce({
        results: [{ uuid: 'uuid-3', name: 'Campaign 3' }],
        count: 3,
      });

      await wrapper.vm.loadMoreData();

      expect(Projects.getMetaCampaigns).toHaveBeenCalledWith({
        search: 'Bulk',
        limit: PAGE_SIZE,
        offset: PAGE_SIZE,
      });
      vi.useRealTimers();
    });

    it('does not request another page when all campaigns are loaded', async () => {
      Projects.getMetaCampaigns.mockResolvedValue({
        results: [
          { uuid: 'uuid-1', name: 'Campaign 1' },
          { uuid: 'uuid-2', name: 'Campaign 2' },
        ],
        count: 2,
      });
      wrapper = createWrapper();
      await nextTick();
      await nextTick();
      Projects.getMetaCampaigns.mockClear();

      await wrapper.vm.loadMoreData();

      expect(Projects.getMetaCampaigns).not.toHaveBeenCalled();
    });
  });
});
