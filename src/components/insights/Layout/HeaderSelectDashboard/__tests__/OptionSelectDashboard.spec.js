import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';

import OptionSelectDashboard from '@/components/insights/Layout/HeaderSelectDashboard/OptionSelectDashboard.vue';
import Unnnic from '@weni/unnnic-system';

const dashboard1 = { name: 'Dashboard 1', uuid: '1' };
const dashboard2 = { name: 'Dashboard 2', uuid: '2' };

describe('OptionSelectDashboard', () => {
  let wrapper;
  const store = createStore({
    modules: {
      dashboards: {
        namespaced: true,
        state: {
          dashboards: [dashboard1, dashboard2],
          currentDashboard: dashboard1,
        },
        getters: {
          dashboardDefault: () => dashboard1,
        },
        actions: {
          setCurrentDashboard({ state }, dashboard) {
            state.currentDashboard = dashboard;
          },
          setDefaultDashboard: vi.fn(() => Promise.resolve()),
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
        },
      },
    });
  };

  let starIcon;
  beforeEach(() => {
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

    it('Should set the current dashboard when an option is clicked', async () => {
      wrapper = createWrapper({
        dashboard: dashboard2,
      });

      const optionSelectDashboard = wrapper.findComponent(
        '[data-testid=option-select-dashboard]',
      );
      await optionSelectDashboard.trigger('click');

      expect(store.state.dashboards.currentDashboard.uuid).toBe('2');
    });

    it('Should have a star_rate icon', () => {
      expect(starIcon.exists()).toBe(true);
      expect(starIcon.props('icon')).toBe('star_rate');
    });

    it('Should fill the star_rate icon if the dashboard is default or on hover', async () => {
      expect(starIcon.classes()).toContain(
        'option-select-dashboard__star-icon--selected',
      );
      expect(starIcon.props('filled')).toBe(true);

      await wrapper.setProps({ dashboard: dashboard2 });

      await starIcon.trigger('mouseenter');
      expect(starIcon.props('filled')).toBe(true);

      await starIcon.trigger('mouseleave');
      expect(starIcon.props('filled')).toBe(false);
    });
  });

  describe('Default Dashboard Functionality', () => {
    it('Should set default dashboard when star icon and dashboard is different from default', async () => {
      const spySetDefaultDashboard = vi.spyOn(
        wrapper.vm,
        'setDefaultDashboard',
      );

      await starIcon.trigger('click');

      expect(spySetDefaultDashboard).not.toHaveBeenCalled();

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
