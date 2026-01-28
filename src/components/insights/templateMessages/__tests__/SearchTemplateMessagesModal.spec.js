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
    await flushPromises();

    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });
    const table = wrapper.findComponent({ name: 'UnnnicDataTable' });
    const buttons = wrapper.findAllComponents({ name: 'UnnnicButton' });

    expect(wrapper.exists()).toBe(true);
    expect(modal.exists()).toBe(true);
    expect(table.exists()).toBe(true);
    expect(buttons.length).toBeGreaterThan(0);
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
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });
    await modal.vm.$emit('update:model-value');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('calls searchTemplates with next cursor when clicking next button', async () => {
    await flushPromises();

    // Clear previous calls
    MetaTemplateMessageService.listTemplates.mockClear();

    // Call searchTemplates with 'next' directly
    await wrapper.vm.searchTemplates('next');

    expect(MetaTemplateMessageService.listTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ after: 'next' }),
    );
  });

  it('calls searchTemplates with previous cursor when clicking previous button', async () => {
    await flushPromises();

    // Clear previous calls
    MetaTemplateMessageService.listTemplates.mockClear();

    // Call searchTemplates with 'previous' directly
    await wrapper.vm.searchTemplates('previous');

    expect(MetaTemplateMessageService.listTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ before: 'previous' }),
    );
  });
});
