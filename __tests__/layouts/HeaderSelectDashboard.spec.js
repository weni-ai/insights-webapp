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

    it.only('Should redirect to the previous page when the "arrow_back" icon is clicked', async () => {
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
});
