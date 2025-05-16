import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import HeaderDashboardSettings from '../HeaderDashboardSettings.vue';
import DrawerDashboardConfig from '../../dashboards/DrawerDashboardConfig.vue';

describe('HeaderDashboardSettings.vue', () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = createTestingPinia({
      initialState: {
        dashboards: {
          currentDashboard: {
            uuid: '123',
            name: 'Dashboard 1',
            is_editable: true,
          },
        },
      },
    });
    wrapper = mount(HeaderDashboardSettings, {
      global: {
        plugins: [store],
        components: { DrawerDashboardConfig },
      },
    });
  });

  it('renders dropdown trigger when dashboard is editable', () => {
    const dropdownTrigger = wrapper.findComponent({ name: 'UnnnicButton' });
    expect(dropdownTrigger.exists()).toBe(true);
  });

  it('shows DrawerDashboardConfig when "showEditDashboard" is true', async () => {
    expect(
      wrapper.findComponent('[data-testid="edit-dashboard-drawer"]').exists(),
    ).toBe(false);

    const optionMenuButton = wrapper.findComponent(
      '[data-testid="options-dashboard-button"]',
    );

    await optionMenuButton.trigger('click');

    const dropdownItem = wrapper.findComponent(
      '[data-testid="edit-dashboard-button"]',
    );

    await dropdownItem.trigger('click');

    expect(wrapper.vm.showEditDashboard).toBe(true);
  });

  it('closes DrawerDashboardConfig when close event is emitted', async () => {
    const optionMenuButton = wrapper.findComponent(
      '[data-testid="options-dashboard-button"]',
    );

    await optionMenuButton.trigger('click');

    const dropdownItem = wrapper.findComponent(
      '[data-testid="edit-dashboard-button"]',
    );

    await dropdownItem.trigger('click');

    expect(wrapper.findComponent(DrawerDashboardConfig).exists()).toBe(true);

    const drawerConfig = wrapper.findComponent(DrawerDashboardConfig);
    await drawerConfig.vm.$emit('close');

    expect(wrapper.findComponent(DrawerDashboardConfig).exists()).toBe(false);
  });
});
