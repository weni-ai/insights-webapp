import { vi, beforeEach, expect } from 'vitest';
import { mount, config, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useMetaTemplateMessage } from '@/store/modules/templates/metaTemplateMessage';

import { createI18n } from 'vue-i18n';
import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import SearchTemplateMessagesModal from '../SearchTemplateMessagesModal.vue';

import MetaTemplateMessageService from '@/services/api/resources/template/metaTemplateMessage';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n];

vi.mock('@/services/api/resources/template/metaTemplateMessage', () => ({
  default: {
    listTemplates: vi.fn().mockResolvedValue({
      results: [
        {
          id: '1',
          name: 'Template 1',
          category: 'Marketing',
          language: 'en',
          status: 'approved',
        },
      ],
      next: 'next',
      previous: 'previous',
    }),
    listMetricsSource: vi.fn().mockResolvedValue([]),
  },
}));

describe('SearchTemplateMessagesModal.vue', () => {
  let store;
  let wrapper;

  const createWrapper = () => {
    return mount(SearchTemplateMessagesModal, {
      global: {
        plugins: [store, UnnnicSystem],
      },
      props: {
        modelValue: true,
      },
    });
  };

  beforeEach(() => {
    store = createTestingPinia({
      initialState: {
        dashboards: {
          currentDashboard: {
            config: { waba_id: '12345' },
          },
        },
        config: {
          project: { uuid: 'abcd' },
        },
      },
    });
    wrapper = createWrapper();
  });

  it('renders modal correctly', async () => {
    const filtersContainer = wrapper.find('[data-testid="filters"]');
    const table = wrapper.find('[data-testid="template-messages-table"]');
    const nextButton = wrapper.find('[data-testid="next-button"]');
    const previousButton = wrapper.find('[data-testid="previous-button"]');

    expect(wrapper.exists()).toBe(true);
    expect(filtersContainer.exists()).toBe(true);
    expect(table.exists()).toBe(true);
    expect(nextButton.exists()).toBe(true);
    expect(previousButton.exists()).toBe(true);
  });

  it('calls searchTemplates on mount', async () => {
    await flushPromises();

    expect(MetaTemplateMessageService.listTemplates).toHaveBeenCalled();
  });

  it('updates filters and triggers search on change name filter', async () => {
    vi.useFakeTimers();
    await flushPromises();
    wrapper.vm.filters.name = 'abc';
    await wrapper.vm.$nextTick();
    vi.advanceTimersByTime(500);
    expect(MetaTemplateMessageService.listTemplates).toHaveBeenCalled();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('calls rowClick and dispatches action', async () => {
    const metaTemplateMessageStore = useMetaTemplateMessage();
    const dispatchSpy = vi.spyOn(
      metaTemplateMessageStore,
      'setSelectedTemplateUuid',
    );
    await wrapper.vm.rowClick({ id: '1' });

    expect(dispatchSpy).toHaveBeenCalledWith('1');
  });

  it('closes modal when close method is called', async () => {
    const modal = wrapper.findComponent(
      '[data-testid="search-template-messages-modal"]',
    );
    await modal.vm.$emit('update:model-value');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('calls searchTemplates with next cursor when clicking next button', async () => {
    await flushPromises();

    await wrapper.find('[data-testid="next-button"]').trigger('click');

    expect(MetaTemplateMessageService.listTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ after: 'next' }),
    );
  });

  it('calls searchTemplates with previous cursor when clicking previous button', async () => {
    await flushPromises();
    await wrapper.find('[data-testid="previous-button"]').trigger('click');

    expect(MetaTemplateMessageService.listTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ before: 'previous' }),
    );
  });
});
