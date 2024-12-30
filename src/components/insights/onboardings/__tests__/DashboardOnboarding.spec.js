import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';

import DashboardOnboarding from '../DashboardOnboarding.vue';

describe('DashboardOnboarding', () => {
  let wrapper;
  let actionsMock;
  let mutationsMock;

  beforeEach(() => {
    actionsMock = {
      'onboarding/beforeOpenDashboardList': vi.fn(),
    };

    mutationsMock = {
      'dashboards/SET_SHOW_DASHBOARD_CONFIG': vi.fn(),
      'onboarding/SET_ONBOARDING_REF': vi.fn(),
      'onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING': vi.fn(),
    };
    const store = createStore({
      modules: {
        onboarding: {
          namespaced: true,
          state: {
            onboardingRefs: {
              'select-dashboard': 'select-dashboard',
              'create-dashboard-button': null,
              'widget-card-metric': null,
              'widget-gallery': null,
              'drawer-card-metric-config': null,
              'widget-graph-empty': null,
              'drawer-graph-empty': null,
              'dashboard-onboarding-tour': {
                name: 'dashboard-onboarding-tour',
                start: vi.fn(),
                attachedElement: 'dashboard-onboarding-tour',
              },
              'widgets-onboarding-tour': null,
            },
            showCreateDashboardOnboarding: false,
            showConfigWidgetOnboarding: false,
            showCompleteOnboardingModal: false,
          },
        },
        dashboards: {
          namespaced: true,
          state: { dashboards: [], currentDashboard: {} },
        },
      },
      actions: actionsMock,
      mutations: mutationsMock,
      dispatch: vi.fn(),
      commit: vi.fn(),
    });

    wrapper = mount(DashboardOnboarding, {
      global: {
        plugins: [store],
        stubs: {
          UnnnicTour: {
            template:
              '<section ref="dashboardOnboardingTour" data-testid="tour"  @close="setShowCreateDashboardOnboarding(false)" @end-tour="setShowDashboardConfig(true)"><slot></slot></section>',
            methods: {
              start: vi.fn(),
              setShowDashboardConfig:
                mutationsMock['dashboards/SET_SHOW_DASHBOARD_CONFIG'],
              setShowCreateDashboardOnboarding:
                mutationsMock[
                  'onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING'
                ],
            },
          },
        },
      },
    });

    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
    const tour = wrapper.find('[data-testid="tour"]');
    expect(tour.exists()).toBe(true);
  });

  it('computes the dashboardTourSteps correctly', () => {
    const steps = wrapper.vm.dashboardTourSteps;
    expect(steps).toHaveLength(2);

    expect(steps[0].title).toBe(
      wrapper.vm.$t('dashboard_onboarding.step.create_dashboard.title'),
    );
    expect(steps[0].attachedElement).toBe('select-dashboard');
  });

  it('calls setOnboardingRef on mounted', async () => {
    await wrapper.vm.$nextTick();
    expect(mutationsMock['onboarding/SET_ONBOARDING_REF']).toHaveBeenCalled();
  });

  it('calls setShowDashboardConfig when the tour ends', async () => {
    const tour = wrapper.findComponent({ ref: 'dashboardOnboardingTour' });
    await tour.vm.$emit('end-tour');
    expect(
      mutationsMock['dashboards/SET_SHOW_DASHBOARD_CONFIG'],
    ).toHaveBeenCalled();
  });

  it('calls setShowCreateDashboardOnboarding when the tour is closed', async () => {
    const tour = wrapper.findComponent({ ref: 'dashboardOnboardingTour' });
    await tour.vm.$emit('close');

    expect(
      mutationsMock['onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING'],
    ).toHaveBeenCalled();
  });
});
