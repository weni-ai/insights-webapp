import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { createRouter, createMemoryHistory } from 'vue-router';

import OptionSelectDashboard from '@/components/insights/Layout/HeaderSelectDashboard/OptionSelectDashboard.vue';
import Unnnic from '@weni/unnnic-system';
import { useDashboards } from '@/store/modules/dashboards';

const dashboard1 = { name: 'Dashboard 1', uuid: '1' };
const dashboard2 = { name: 'Dashboard 2', uuid: '2' };

const createTestRouter = async (routeName = 'dashboard') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/dashboard/:dashboardUuid?',
        name: 'dashboard',
        component: { template: '<div />' },
      },
      {
        path: '/report',
        name: 'report',
        component: { template: '<div />' },
      },
    ],
  });
  await router.push({ name: routeName });
  return router;
};

describe('OptionSelectDashboard', () => {
  let wrapper;
  let testRouter;
  const store = createTestingPinia({
    initialState: {
      config: { enableCreateCustomDashboards: false },
      dashboards: {
        setDefaultDashboard: vi.fn(() => Promise.resolve()),
        dashboardDefault: dashboard1,
        dashboards: [dashboard1, dashboard2],
        currentDashboard: dashboard1,
      },
    },
  });

  const createWrapper = async (props, routeName = 'dashboard') => {
    testRouter = await createTestRouter(routeName);
    return mount(OptionSelectDashboard, {
      props,
      global: {
        plugins: [store, testRouter],
        stubs: {
          UnnnicDropdownItem: Unnnic.unnnicDropdownItem,
          UnnnicIcon: true,
        },
        mocks: {
          $t: (msg) => msg,
        },
      },
    });
  };

  let starIcon;

  beforeEach(async () => {
    vi.clearAllMocks();
    const dashboardsStore = useDashboards();
    dashboardsStore.currentDashboard = dashboard1;
    dashboardsStore.dashboardDefault = dashboard1;
    wrapper = await createWrapper({ dashboard: dashboard1 });
    starIcon = wrapper.findComponent('[data-testid=star-icon]');
  });

  describe('Rendering and Interactions', () => {
    it('Should display the name of the dashboard prop', () => {
      const optionSelectDashboard = wrapper.findComponent(
        '[data-testid=option-select-dashboard]',
      );

      expect(optionSelectDashboard.exists()).toBe(true);
      expect(optionSelectDashboard.text()).toContain('Dashboard 1');
    });

    it('Should set the current dashboard when an option is clicked on a non-report route', async () => {
      wrapper = await createWrapper(
        {
          dashboard: dashboard2,
        },
        'dashboard',
      );

      const dashboardsStore = useDashboards();
      const setCurrentDashboardSpy = vi
        .spyOn(dashboardsStore, 'setCurrentDashboard')
        .mockImplementation((dash) => {
          dashboardsStore.currentDashboard = dash;
        });

      const optionSelectDashboard = wrapper.findComponent(
        '[data-testid=option-select-dashboard]',
      );
      await optionSelectDashboard.trigger('click');

      expect(setCurrentDashboardSpy).toHaveBeenCalledWith(dashboard2);
      expect(dashboardsStore.currentDashboard.uuid).toBe('2');
    });

    it('Should navigate to dashboard route when clicking on option while in report route', async () => {
      wrapper = await createWrapper(
        {
          dashboard: dashboard2,
        },
        'report',
      );

      const dashboardsStore = useDashboards();
      const setCurrentDashboardSpy = vi.spyOn(
        dashboardsStore,
        'setCurrentDashboard',
      );
      const pushSpy = vi.spyOn(testRouter, 'push');

      const optionSelectDashboard = wrapper.findComponent(
        '[data-testid=option-select-dashboard]',
      );
      await optionSelectDashboard.trigger('click');

      expect(pushSpy).toHaveBeenCalledWith({
        name: 'dashboard',
        params: {
          dashboardUuid: dashboard2.uuid,
        },
      });
      expect(setCurrentDashboardSpy).not.toHaveBeenCalled();
    });

    it('Should have a star_rate icon', () => {
      expect(starIcon.exists()).toBe(true);
      expect(starIcon.props('icon')).toBe('star_rate');
    });
  });

  describe('Default Dashboard Functionality', () => {
    it('Should set default dashboard when star icon and dashboard is different from default', async () => {
      const spySetDefaultDashboard = vi.spyOn(
        useDashboards(),
        'setDefaultDashboard',
      );

      await wrapper.setProps({ dashboard: dashboard2 });

      await starIcon.trigger('click');

      expect(spySetDefaultDashboard).toHaveBeenCalled();
    });

    it('Should show a success alert if the default dashboard is set', async () => {
      await wrapper.setProps({ dashboard: dashboard2 });
      const spyUnnnicAlert = vi
        .spyOn(Unnnic, 'unnnicCallAlert')
        .mockImplementation(() => {});
      const createAlertMsg = (type) =>
        type === 'error'
          ? 'Error setting the Dashboard 2 dashboard as your homepage'
          : 'Now the Dashboard 2 dashboard is your homepage';

      vi.spyOn(useDashboards(), 'setDefaultDashboard').mockImplementationOnce(
        () => Promise.reject(new Error('fail')),
      );
      await starIcon.trigger('click');
      await wrapper.vm.$nextTick();
      expect(spyUnnnicAlert).toHaveBeenCalledWith({
        props: {
          text: createAlertMsg('error'),
          type: 'error',
        },
        seconds: 5,
      });

      vi.spyOn(useDashboards(), 'setDefaultDashboard').mockImplementationOnce(
        () => Promise.resolve(),
      );
      await starIcon.trigger('click');
      await wrapper.vm.$nextTick();
      expect(spyUnnnicAlert).toHaveBeenCalledWith({
        props: {
          text: createAlertMsg('success'),
          type: 'success',
        },
        seconds: 5,
      });
    });
  });

  it('Should match the snapshot', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
