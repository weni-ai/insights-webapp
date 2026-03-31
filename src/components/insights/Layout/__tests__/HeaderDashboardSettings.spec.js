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
    expect(wrapper.findComponent(DrawerDashboardConfig).exists()).toBe(false);

    await wrapper.vm.handleEditDashboard();

    expect(wrapper.vm.showEditDashboard).toBe(true);
    expect(wrapper.findComponent(DrawerDashboardConfig).exists()).toBe(true);
  });

  it('closes DrawerDashboardConfig when close event is emitted', async () => {
    await wrapper.vm.handleEditDashboard();

    expect(wrapper.findComponent(DrawerDashboardConfig).exists()).toBe(true);

    const drawerConfig = wrapper.findComponent(DrawerDashboardConfig);
    await drawerConfig.vm.$emit('close');

    expect(wrapper.findComponent(DrawerDashboardConfig).exists()).toBe(false);
  });
});
