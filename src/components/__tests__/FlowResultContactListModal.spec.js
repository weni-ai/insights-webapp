import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, config } from '@vue/test-utils';

import UnnnicSystem from '@/utils/plugins/UnnnicSystem';
import { createTestingPinia } from '@pinia/testing';
import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
  fallbackWarn: false,
  missingWarn: false,
});

config.global.plugins = [i18n, UnnnicSystem];

import FlowResultContactListModal from '@/components/FlowResultContactListModal.vue';

import Widget from '@/services/api/resources/widgets';

vi.mock('@/services/api/resources/widgets', () => ({
  default: {
    getFlowContactResults: vi.fn(),
  },
}));

const store = createTestingPinia();

describe('FlowResultContactListModal.vue', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    Widget.getFlowContactResults.mockResolvedValue({
      pagination: { total_items: 2 },
      contacts: [
        {
          contact: { name: 'John Doe' },
          urn: '12345',
          start: '2024-02-05T12:00:00Z',
        },
        {
          contact: { name: 'Jane Doe' },
          urn: '67890',
          start: '',
        },
      ],
    });

    wrapper = mount(FlowResultContactListModal, {
      global: {
        plugins: [store, i18n],
      },
      props: {
        flowResultLabel: 'Test Label',
        flow: { uuid: 'flow-uuid', result: 'flow-result' },
      },
    });
  });

  it('renders the modal with correct title', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('contact_list_modal.title');
  });

  it('fetches data and updates table rows', async () => {
    await wrapper.vm.$nextTick();
    expect(Widget.getFlowContactResults).toHaveBeenCalledWith({
      page: 1,
      limit: 5,
      result: 'flow-result',
      flow: 'flow-uuid',
      label: 'Test Label',
    });
    expect(wrapper.vm.rows.length).toBe(2);
  });

  it('emits close event on API failure', async () => {
    Widget.getFlowContactResults.mockRejectedValue(new Error('API Error'));
    wrapper = mount(FlowResultContactListModal, {
      global: {
        plugins: [store, i18n],
      },
      props: {
        flowResultLabel: 'Test Label',
        flow: { uuid: 'flow-uuid', result: 'flow-result' },
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should emit close event when modal is closed', async () => {
    await wrapper
      .findComponent('[data-testid="contact-list-modal"]')
      .vm.$emit('update:model-value', false);
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should change page value when table update:pagination', async () => {
    await wrapper.vm.$nextTick();
    await wrapper
      .findComponent('[data-testid="contact-list-table"]')
      .vm.$emit('update:pagination', 2);
    expect(wrapper.vm.page).toBe(2);
    expect(Widget.getFlowContactResults).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      result: 'flow-result',
      flow: 'flow-uuid',
      label: 'Test Label',
    });
  });
});
