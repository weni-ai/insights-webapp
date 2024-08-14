import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import { createStore } from 'vuex';
import { routes } from '@/router';

import HeaderSelectDashboard from '@/components/insights/Layout/HeaderSelectDashboard.vue';

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
          dashboards: [{ name: 'Dashboard 1' }, { name: 'Dashboard 2' }],
          currentDashboard: { name: 'Current Dashboard' },
        },
        getters: {
          dashboardDefault: () => ({ name: 'Default Dashboard' }),
        },
      },
      config: {
        namespaced: true,
        state: {
          enableCreateCustomDashboards: true,
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
      expect(dashboardTitle.text()).toBe('Current Dashboard');
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
    it('Should have an option with the title "add_new_dashboard"', () => {});

    it('Should open the DrawerDashboardConfig when the "add_new_dashboard" option is clicked', () => {});
  });

  it('Should match the snapshot', () => {});
});
