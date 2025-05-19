import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';
import { useOnboarding } from '@/store/modules/onboarding';
import { useDashboards } from '@/store/modules/dashboards';

import DashboardOnboarding from '../DashboardOnboarding.vue';

describe('DashboardOnboarding', () => {
  let wrapper;
  let spys;

  beforeEach(() => {
    const store = createTestingPinia({
      initialState: {
        dashboards: { dashboards: [], currentDashboard: {} },
        onboarding: {
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
              setShowDashboardConfig: vi.fn(),
              setShowCreateDashboardOnboarding: vi.fn(),
            },
          },
        },
      },
    });

    const onboardingStore = useOnboarding();
    const dashboardsStore = useDashboards();

    spys = {
      setShowDashboardConfig: vi.spyOn(
        dashboardsStore,
        'setShowDashboardConfig',
      ),
      setOnboardingRef: vi.spyOn(onboardingStore, 'setOnboardingRef'),
      setShowCreateDashboardOnboarding: vi.spyOn(
        onboardingStore,
        'setShowCreateDashboardOnboarding',
      ),
    };

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
    expect(spys.setOnboardingRef).toHaveBeenCalled();
  });

  it('calls setShowDashboardConfig when the tour ends', async () => {
    const tour = wrapper.findComponent({ ref: 'dashboardOnboardingTour' });
    await tour.vm.$emit('end-tour');
    expect(spys.setShowDashboardConfig).toHaveBeenCalled();
  });

  it('calls setShowCreateDashboardOnboarding when the tour is closed', async () => {
    const tour = wrapper.findComponent({ ref: 'dashboardOnboardingTour' });
    await tour.vm.$emit('close');

    expect(spys.setShowCreateDashboardOnboarding).toHaveBeenCalled();
  });
});
