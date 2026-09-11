import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';

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
        plugins: [store],
      },
      props: {
        flowResultLabel: 'Test Label',
        flow: { uuid: 'flow-uuid', result: 'flow-result' },
      },
    });
  });

  it('renders the modal with correct title', async () => {
    await wrapper.vm.$nextTick();
    const modal = wrapper.findComponent({ name: 'UnnnicDialog' });
    expect(modal.exists()).toBe(true);
    const title = wrapper.findComponent({ name: 'UnnnicDialogTitle' });
    expect(title.text()).toContain('Test Label');
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
        plugins: [store],
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
    const modal = wrapper.findComponent({ name: 'UnnnicDialog' });
    await modal.vm.$emit('update:open', false);
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should change page value when table update:pagination', async () => {
    await wrapper.vm.$nextTick();
    const table = wrapper.findComponent({ name: 'UnnnicTableNext' });
    await table.vm.$emit('update:pagination', 2);
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
