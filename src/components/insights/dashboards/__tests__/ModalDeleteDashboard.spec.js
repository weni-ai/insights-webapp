import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';

import unnnic from '@weni/unnnic-system';

import ModalDeleteDashboard from '../ModalDeleteDashboard.vue';

import Dashboards from '@/services/api/resources/dashboards';

vi.mock('@/services/api/resources/dashboards');

describe('ModalDeleteDashboard', () => {
  let store;
  let wrapper;
  const mockDashboard = {
    uuid: '123',
    name: 'Test Dashboard',
  };

  beforeEach(() => {
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
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });
    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');

    expect(modal.exists()).toBe(true);
    expect(modal.props('modelValue')).toBe(true);
    expect(modal.props('title')).toContain(mockDashboard.name);
    expect(input.exists()).toBe(true);
    expect(wrapper.vm.validDashboardName).toBe(false);
  });

  it('enables primary button only if dashboard name matches', async () => {
    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });

    expect(modal.props('primaryButtonProps').disabled).toBe(true);

    await input.setValue('Test Dashboard');

    expect(modal.props('primaryButtonProps').disabled).toBe(false);
  });

  it('calls deleteDashboard on primary button click', async () => {
    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });

    await input.setValue('Test Dashboard');
    await modal.vm.$emit('primary-button-click');

    expect(Dashboards.deleteDashboard).toHaveBeenCalledWith(mockDashboard.uuid);
  });

  it('shows success alert and updates state on successful deletion', async () => {
    const callAlertSpy = vi.spyOn(unnnic, 'unnnicCallAlert');
    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });

    await input.setValue('Test Dashboard');
    await modal.vm.$emit('primary-button-click');
    await wrapper.vm.$nextTick();

    expect(callAlertSpy).toHaveBeenCalledWith({
      props: {
        text: wrapper.vm.$t('delete_dashboard.alert.success'),
        type: 'success',
      },
      seconds: 5,
    });
  });

  it('shows error alert on failed deletion', async () => {
    const callAlertSpy = vi.spyOn(unnnic, 'unnnicCallAlert');
    Dashboards.deleteDashboard.mockRejectedValueOnce(new Error('Failed'));

    const input = wrapper.findComponent('[data-testid="input-dashboard-name"]');
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });

    await input.setValue('Test Dashboard');
    await modal.vm.$emit('primary-button-click');
    await wrapper.vm.$nextTick();

    expect(Dashboards.deleteDashboard).toHaveBeenCalled();

    expect(callAlertSpy).toHaveBeenCalledWith({
      props: {
        text: wrapper.vm.$t('delete_dashboard.alert.error'),
        type: 'error',
      },
      seconds: 5,
    });
  });

  it('closes modal and emits close event when secondary button is clicked', async () => {
    const modal = wrapper.findComponent({ name: 'UnnnicModalDialog' });

    await modal.vm.$emit('update:model-value', false);

    expect(wrapper.emitted('close')).toBeTruthy();
  });
});
