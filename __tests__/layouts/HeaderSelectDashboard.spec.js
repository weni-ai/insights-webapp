import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createStore } from 'vuex';
import { routes } from '@/router';

import HeaderSelectDashboard from '@/components/insights/Layout/HeaderSelectDashboard/index.vue';

describe('HeaderSelectDashboard', () => {
  let wrapper;
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });
  const store = createStore({
    modules: {
      dashboards: {
        namespaced: true,
        state: {
          dashboards: [
            { name: 'Dashboard 1', uuid: '1' },
            { name: 'Dashboard 2', uuid: '2' },
          ],
          currentDashboard: { name: 'Dashboard 1', uuid: '1' },
        },
        getters: {
          dashboardDefault: () => ({ name: 'Default Dashboard' }),
        },
      },
      config: {
        namespaced: true,
        state: {
          enableCreateCustomDashboards: false,
        },
      },
    },
  });

  const createWrapper = (props) => {
    return mount(HeaderSelectDashboard, {
      props,
      global: {
        plugins: [router, store],
        stubs: {
          UnnnicAvatarIcon: true,
          UnnnicIcon: true,
          OptionSelectDashboard: true,
          OptionCreateNewDashboard: true,
          DrawerDashboardConfig: true,
        },
      },
    });
  };

  beforeEach(async () => {
    router.push('/');
    wrapper = createWrapper({});
    await flushPromises();
  });

  describe('Title icon', () => {
    it('Should display a "monitoring" icon when the current route is named "dashboard"', async () => {
      router.push({ name: 'dashboard', params: { dashboardUuid: '1' } });
      await flushPromises();

      const dashboardIcon = wrapper.findComponent(
        '[data-testid=dashboard-icon]',
      );
      expect(dashboardIcon.exists()).toBe(true);
      expect(dashboardIcon.props('icon')).toBe('monitoring');
    });

    it('Should display an "arrow_back" icon when the current route is not "dashboard"', async () => {
      router.push({
        name: 'report',
        params: { dashboardUuid: '1', widgetUuid: '2' },
      });
      await flushPromises();

      const dashboardIcon = wrapper.findComponent(
        '[data-testid=dashboard-icon]',
      );
      const backIcon = wrapper.findComponent('[data-testid=back-icon]');

      expect(dashboardIcon.exists()).toBe(false);
      expect(backIcon.exists()).toBe(true);
      expect(backIcon.props('icon')).toBe('arrow_back');
    });

    it('Should redirect to the previous page when the "arrow_back" icon is clicked', async () => {
      vi.spyOn(router, 'back');

      router.push({
        name: 'report',
        params: { dashboardUuid: '1', widgetUuid: '2' },
      });
      await flushPromises();

      const backIcon = wrapper.findComponent('[data-testid=back-icon]');
      await backIcon.trigger('click');

      expect(router.back).toHaveBeenCalled();
    });
  });

  describe('Title', () => {
    it('Should display the name of the currentDashboard if available', () => {
      const dashboardTitle = wrapper.find('[data-testid=dashboard-title]');

      expect(dashboardTitle.exists()).toBe(true);
      expect(dashboardTitle.text()).toBe('Dashboard 1');
    });
  });

  describe('Dropdown behavior', () => {
    it('Should display an "expand_more" icon', () => {
      const expandIcon = wrapper.findComponent('[data-testid=expand-icon]');

      expect(expandIcon.exists()).toBe(true);
      expect(expandIcon.props('icon')).toBe('expand_more');
    });

    it('Should have a dropdown with links matching the length of the dashboards array', async () => {
      const dropdownTrigger = wrapper.find('[data-testid=dropdown-trigger]');
      await dropdownTrigger.trigger('click');
      const selectDashboardItems = wrapper.findAll(
        '[data-testid=select-dashboard-item]',
      );

      expect(selectDashboardItems.length).toBe(
        store.state.dashboards.dashboards.length,
      );
    });
  });

  describe('Add new dashboard', () => {
    let addNewDashboardButton;

    beforeEach(async () => {
      store.state.config.enableCreateCustomDashboards = true;

      const dropdownTrigger = wrapper.find('[data-testid=dropdown-trigger]');
      await dropdownTrigger.trigger('click');

      addNewDashboardButton = wrapper.findComponent(
        '[data-testid=add-new-dashboard-button]',
      );
    });

    it('Should display "Create New Dashboard" option when custom dashboards are enabled in the project', async () => {
      expect(addNewDashboardButton.exists()).toBe(true);

      store.state.config.enableCreateCustomDashboards = false;
      await wrapper.vm.$nextTick();
      expect(addNewDashboardButton.exists()).toBe(false);
    });

    it('Should open the DrawerDashboardConfig when the "Create New Dashboard" option is clicked', async () => {
      const drawerDashboardConfigBeforeClick = wrapper.findComponent(
        '[data-testid=drawer-dashboard-config]',
      );
      expect(drawerDashboardConfigBeforeClick.exists()).toBe(false);

      await addNewDashboardButton.trigger('click');
      await wrapper.vm.$nextTick();

      const drawerDashboardConfigAfterClick = wrapper.findComponent(
        '[data-testid=drawer-dashboard-config]',
      );
      expect(drawerDashboardConfigAfterClick.exists()).toBe(true);
    });
  });

  it('Should match the snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
