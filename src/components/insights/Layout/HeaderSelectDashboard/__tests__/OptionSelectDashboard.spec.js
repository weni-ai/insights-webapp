import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import OptionSelectDashboard from '@/components/insights/Layout/HeaderSelectDashboard/OptionSelectDashboard.vue';
import Unnnic from '@weni/unnnic-system';
import { useDashboards } from '@/store/modules/dashboards';

const dashboard1 = { name: 'Dashboard 1', uuid: '1' };
const dashboard2 = { name: 'Dashboard 2', uuid: '2' };

describe('OptionSelectDashboard', () => {
  let wrapper;
  const store = createTestingPinia({
    initialState: {
      config: { enableCreateCustomDashboards: false },
      dashboards: {
        setDefaultDashboard: vi.fn(() => Promise.resolve()),
        dashboardDefault: () => dashboard1,
        dashboards: [dashboard1, dashboard2],
        currentDashboard: dashboard1,
      },
    },
  });

  const mockRouter = {
    push: vi.fn(),
  };

  const createWrapper = (props, routeName = 'dashboard') => {
    return mount(OptionSelectDashboard, {
      props,
      global: {
        plugins: [store],
        stubs: {
          UnnnicDropdownItem: Unnnic.unnnicDropdownItem,
          UnnnicIcon: true,
        },
        mocks: {
          $t: (msg) => msg,
          $route: { name: routeName },
          $router: mockRouter,
        },
      },
    });
  };

  let starIcon;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouter.push.mockClear();
    wrapper = createWrapper({ dashboard: dashboard1 });
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
      wrapper = createWrapper(
        {
          dashboard: dashboard2,
        },
        'dashboard',
      );

      const dashboardsStore = useDashboards();

      dashboardsStore.setCurrentDashboard = vi.fn((dash) => {
        dashboardsStore.currentDashboard = dash;
      });

      const optionSelectDashboard = wrapper.findComponent(
        '[data-testid=option-select-dashboard]',
      );
      await optionSelectDashboard.trigger('click');

      expect(dashboardsStore.setCurrentDashboard).toHaveBeenCalledWith(
        dashboard2,
      );
      expect(dashboardsStore.currentDashboard.uuid).toBe('2');
    });

    it('Should navigate to dashboard route when clicking on option while in report route', async () => {
      wrapper = createWrapper(
        {
          dashboard: dashboard2,
        },
        'report',
      );

      const dashboardsStore = useDashboards();
      dashboardsStore.setCurrentDashboard = vi.fn();

      mockRouter.push.mockClear();

      const optionSelectDashboard = wrapper.findComponent(
        '[data-testid=option-select-dashboard]',
      );
      await optionSelectDashboard.trigger('click');

      expect(mockRouter.push).toHaveBeenCalledWith({
        name: 'dashboard',
        params: {
          dashboardUuid: dashboard2.uuid,
        },
      });
      expect(dashboardsStore.setCurrentDashboard).not.toHaveBeenCalled();
    });

    it('Should have a star_rate icon', () => {
      expect(starIcon.exists()).toBe(true);
      expect(starIcon.props('icon')).toBe('star_rate');
    });
  });

  describe('Default Dashboard Functionality', () => {
    it('Should set default dashboard when star icon and dashboard is different from default', async () => {
      const spySetDefaultDashboard = vi.spyOn(
        wrapper.vm,
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
        wrapper.vm.$t(`insights_header.set_default_dashboard_${type}`, {
          dashboard: dashboard2.name,
        });

      wrapper.vm.setDefaultDashboard = vi.fn(() => Promise.reject());
      await starIcon.trigger('click');
      expect(spyUnnnicAlert).toHaveBeenCalledWith({
        props: {
          text: createAlertMsg('error'),
          type: 'error',
        },
        seconds: 5,
      });

      wrapper.vm.setDefaultDashboard = vi.fn(() => Promise.resolve());
      await starIcon.trigger('click');
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
