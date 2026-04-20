import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';

import { UnnnicCallAlert } from '@weni/unnnic-system';

import ModalDeleteDashboard from '../ModalDeleteDashboard.vue';

import Dashboards from '@/services/api/resources/dashboards';

vi.mock('@/services/api/resources/dashboards');

vi.mock('@weni/unnnic-system', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    UnnnicCallAlert: vi.fn(),
  };
});

describe('ModalDeleteDashboard', () => {
  let store;
  let wrapper;
  const mockDashboard = {
    uuid: '123',
    name: 'Test Dashboard',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    store = createTestingPinia({
      initialState: {
        dashboards: {
          dashboards: [mockDashboard],
          dashboardDefault: () => mockDashboard,
        },
      },
    });

    Dashboards.deleteDashboard.mockResolvedValue();

    wrapper = mount(ModalDeleteDashboard, {
      props: { modelValue: true, dashboard: mockDashboard },
      global: { plugins: [store] },
    });
  });

  it('renders correctly with required props', () => {
    const modal = wrapper.findComponent({ name: 'UnnnicDialog' });
    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');
    const title = wrapper.findComponent({ name: 'UnnnicDialogTitle' });

    expect(modal.exists()).toBe(true);
    expect(modal.props('open')).toBe(true);
    expect(title.text()).toContain(mockDashboard.name);
    expect(input.exists()).toBe(true);
    expect(wrapper.vm.validDashboardName).toBe(false);
  });

  it('enables primary button only if dashboard name matches', async () => {
    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');
    const deleteBtn = wrapper.findComponent('[data-testid="delete-dashboard-submit"]');

    expect(deleteBtn.props('disabled')).toBe(true);

    await input.setValue('Test Dashboard');

    expect(deleteBtn.props('disabled')).toBe(false);
  });

  it('calls deleteDashboard on primary button click', async () => {
    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');
    const deleteBtn = wrapper.findComponent('[data-testid="delete-dashboard-submit"]');

    await input.setValue('Test Dashboard');
    await deleteBtn.trigger('click');

    expect(Dashboards.deleteDashboard).toHaveBeenCalledWith(mockDashboard.uuid);
  });

  it('shows success alert and updates state on successful deletion', async () => {
    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');
    const deleteBtn = wrapper.findComponent('[data-testid="delete-dashboard-submit"]');

    await input.setValue('Test Dashboard');
    await deleteBtn.trigger('click');
    await flushPromises();

    expect(UnnnicCallAlert).toHaveBeenCalledWith({
      props: {
        text: wrapper.vm.$t('delete_dashboard.alert.success'),
        type: 'success',
      },
      seconds: 5,
    });
  });

  it('shows error alert on failed deletion', async () => {
    Dashboards.deleteDashboard.mockRejectedValueOnce(new Error('Failed'));

    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');
    const deleteBtn = wrapper.findComponent('[data-testid="delete-dashboard-submit"]');

    await input.setValue('Test Dashboard');
    await deleteBtn.trigger('click');
    await flushPromises();

    expect(Dashboards.deleteDashboard).toHaveBeenCalled();

    expect(UnnnicCallAlert).toHaveBeenCalledWith({
      props: {
        text: wrapper.vm.$t('delete_dashboard.alert.error'),
        type: 'error',
      },
      seconds: 5,
    });
  });

  it('closes modal and emits close event when secondary button is clicked', async () => {
    const modal = wrapper.findComponent({ name: 'UnnnicDialog' });

    await modal.vm.$emit('update:open', false);

    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
