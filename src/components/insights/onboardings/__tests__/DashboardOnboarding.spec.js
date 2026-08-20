import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';
import { useOnboarding } from '@/store/modules/onboarding';
import { useDashboards } from '@/store/modules/dashboards';

import DashboardOnboarding from '../DashboardOnboarding.vue';

describe('DashboardOnboarding', () => {
  let wrapper;
  let spys;

  const tour = () => wrapper.findComponent('[data-testid="tour"]');

  beforeEach(() => {
    const pinia = createTestingPinia({
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

    wrapper = mount(DashboardOnboarding, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicTour: {
            props: ['steps'],
            template: '<section data-testid="tour"><slot></slot></section>',
          },
        },
      },
    });
  });

  it('renders the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
    expect(tour().exists()).toBe(true);
  });

  it('computes the dashboardTourSteps correctly', () => {
    const steps = tour().props('steps');
    expect(steps).toHaveLength(2);

    expect(steps[0].title).toBe(
      wrapper.vm.$t('dashboard_onboarding.step.create_dashboard.title'),
    );
    expect(steps[0].attachedElement).toBe('select-dashboard');
  });

  it('calls setOnboardingRef on mounted', async () => {
    await flushPromises();
    expect(spys.setOnboardingRef).toHaveBeenCalled();
  });

  it('calls setShowDashboardConfig when the tour ends', async () => {
    await tour().vm.$emit('end-tour');
    expect(spys.setShowDashboardConfig).toHaveBeenCalled();
  });

  it('calls setShowCreateDashboardOnboarding when the tour is closed', async () => {
    await tour().vm.$emit('close');

    expect(spys.setShowCreateDashboardOnboarding).toHaveBeenCalled();
  });
});
