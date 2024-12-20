import { describe, vi, beforeEach, it, expect, afterEach } from 'vitest';
import { createStore } from 'vuex';

import onboarding from '@/store/modules/onboarding';
import { asyncTimeout } from '@/utils/time';

vi.mock('@/utils/time', () => ({
  asyncTimeout: vi.fn(
    (timeout = 0) => new Promise((resolve) => setTimeout(resolve, timeout)),
  ),
}));

describe('Onboarding Store Module', () => {
  let store;

  beforeEach(() => {
    store = createStore({
      modules: {
        onboarding: { ...onboarding, namespaced: true },
      },
    });
  });

  describe('mutations', () => {
    it('should have an initial state with onboardingRefs set to null', () => {
      expect(store.state.onboarding.onboardingRefs).toEqual({
        'create-dashboard-button': null,
        'dashboard-onboarding-tour': null,
        'drawer-card-metric-config': null,
        'drawer-graph-empty': null,
        'select-dashboard': null,
        'widget-card-metric': null,
        'widget-gallery': null,
        'widget-graph-empty': null,
        'widgets-onboarding-tour': null,
      });
    });

    it('should set onboardingRefs when SET_ONBOARDING_REF mutation is committed', () => {
      const ref = { key: 'select-dashboard', ref: 'ref' };
      store.commit('onboarding/SET_ONBOARDING_REF', ref);
      expect(store.state.onboarding.onboardingRefs).toMatchObject({
        'select-dashboard': 'ref',
      });
    });

    it('should set showCreateDashboardOnboarding when SET_SHOW_CREATE_DASHBOARD_ONBOARDING mutation is committed', () => {
      store.commit('onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING', true);
      expect(store.state.onboarding.showCreateDashboardOnboarding).toBe(true);
    });

    it('should set showConfigWidgetOnboarding when SET_SHOW_CONFIG_WIDGETS_ONBOARDING mutation is committed', () => {
      store.commit('onboarding/SET_SHOW_CONFIG_WIDGETS_ONBOARDING', true);
      expect(store.state.onboarding.showConfigWidgetOnboarding).toBe(true);
    });

    it('should set showCompleteOnboardingModal when SET_SHOW_COMPLETE_ONBOARDING_MODAL mutation is committed', () => {
      store.commit('onboarding/SET_SHOW_COMPLETE_ONBOARDING_MODAL', true);
      expect(store.state.onboarding.showCompleteOnboardingModal).toBe(true);
    });
  });

  describe('actions', () => {
    describe('callTourNextStep', () => {
      const testCases = [
        {
          name: 'should call onboarding next step if showCreateDashboardOnboarding is true',
          showCreateDashboardOnboarding: true,
        },
        {
          name: 'should call onboarding next step if showConfigWidgetOnboarding is true',
          showConfigWidgetOnboarding: true,
        },
        {
          name: 'should not call onboarding next step if showCreateDashboardOnboarding or showConfigWidgetOnboarding is true',
          expectedCalls: 0,
        },
      ];

      testCases.forEach(
        ({
          name,
          showCreateDashboardOnboarding = false,
          showConfigWidgetOnboarding = false,
          expectedCalls = 1,
        }) => {
          it(name, async () => {
            const nextStepSpy = vi.fn();
            const ref = {
              key: 'select-dashboard',
              ref: {
                nextStep: nextStepSpy,
              },
            };
            store.commit('onboarding/SET_ONBOARDING_REF', ref);
            store.commit(
              'onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING',
              showCreateDashboardOnboarding,
            );
            store.commit(
              'onboarding/SET_SHOW_CONFIG_WIDGETS_ONBOARDING',
              showConfigWidgetOnboarding,
            );
            await store.dispatch(
              'onboarding/callTourNextStep',
              'select-dashboard',
            );
            expect(nextStepSpy).toHaveBeenCalledTimes(expectedCalls);
          });
        },
      );
    });

    describe('callTourPreviousStep', () => {
      const testCases = [
        {
          name: 'should call onboarding previous step if showCreateDashboardOnboarding is true',
          showCreateDashboardOnboarding: true,
        },
        {
          name: 'should call onboarding previous step if showConfigWidgetOnboarding is true',
          showConfigWidgetOnboarding: true,
        },
        {
          name: 'should call onboarding previous step correctly',
          showCreateDashboardOnboarding: true,
          currentStep: 2,
        },
        {
          name: 'should not call onboarding previous step if showCreateDashboardOnboarding or showConfigWidgetOnboarding is true',
          expectedCalls: 0,
          expectedStep: undefined,
        },
      ];

      testCases.forEach(
        ({
          name,
          showCreateDashboardOnboarding = false,
          showConfigWidgetOnboarding = false,
          expectedCalls = 1,
          currentStep,
          expectedStep = 1,
        }) => {
          it(name, async () => {
            const handleStepSpy = vi.fn();
            const ref = {
              key: 'select-dashboard',
              ref: {
                currentStep,
                handleStep: handleStepSpy,
              },
            };
            store.commit('onboarding/SET_ONBOARDING_REF', ref);
            store.commit(
              'onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING',
              showCreateDashboardOnboarding,
            );
            store.commit(
              'onboarding/SET_SHOW_CONFIG_WIDGETS_ONBOARDING',
              showConfigWidgetOnboarding,
            );
            await store.dispatch('onboarding/callTourPreviousStep', {
              tour: ref.key,
            });

            expect(handleStepSpy).toHaveBeenCalledTimes(expectedCalls);

            if (currentStep) {
              expect(handleStepSpy).toHaveBeenCalledWith(expectedStep);
            }
          });
        },
      );
    });

    describe('beforeOpenDashboardList', () => {
      const mockDashboardName = { click: vi.fn() };

      beforeEach(() => {
        store.commit('onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING', true);

        vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
          if (selector === '[data-testid="dropdown-trigger"]') {
            return mockDashboardName;
          }
          if (selector === '[data-onboarding-id="create-dashboard-button"]') {
            return { id: 'mock-ref' };
          }
          return null;
        });
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('should click on dashboard name', async () => {
        await store.dispatch('onboarding/beforeOpenDashboardList');
        expect(mockDashboardName.click).toHaveBeenCalled();
      });

      it('should commit SET_ONBOARDING_REF mutation with correct key and ref', async () => {
        await store.dispatch('onboarding/beforeOpenDashboardList');

        expect(store.state.onboarding.onboardingRefs).toMatchObject({
          'create-dashboard-button': { id: 'mock-ref' },
        });
      });

      it('should not call click on dashboard name if showCreateDashboardOnboarding is false', async () => {
        store.commit('onboarding/SET_SHOW_CREATE_DASHBOARD_ONBOARDING', false);
        await store.dispatch('onboarding/beforeOpenDashboardList');
        expect(mockDashboardName.click).not.toHaveBeenCalled();
      });
    });

    describe('beforeOpenWidgetConfig', () => {
      beforeEach(() => {
        store.commit('onboarding/SET_SHOW_CONFIG_WIDGETS_ONBOARDING', true);

        vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
          if (selector === '[data-onboarding-id="widget-gallery"]') {
            return { id: 'mock-ref' };
          }
          return null;
        });
      });

      it('should return if showConfigWidgetOnboarding is false', async () => {
        store.commit('onboarding/SET_SHOW_CONFIG_WIDGETS_ONBOARDING', false);
        const response = await store.dispatch(
          'onboarding/beforeOpenWidgetConfig',
        );
        expect(response).toBeUndefined();
      });

      it('should click on button config if widgetGallery is undefined', async () => {
        const mockButtonConfig = { click: vi.fn() };
        vi.spyOn(document, 'querySelector').mockImplementationOnce(() => null);
        store.commit('onboarding/SET_ONBOARDING_REF', {
          key: 'widget-card-metric',
          ref: { querySelector: vi.fn().mockReturnValue(mockButtonConfig) },
        });

        await store.dispatch('onboarding/beforeOpenWidgetConfig');
        expect(mockButtonConfig.click).toHaveBeenCalled();
      });

      it('should commit SET_ONBOARDING_REF mutation with correct key and ref', async () => {
        await store.dispatch('onboarding/beforeOpenWidgetConfig');
        expect(store.state.onboarding.onboardingRefs).toMatchObject({
          'widget-gallery': { id: 'mock-ref' },
        });
      });

      it('should call asyncTimeout with 300ms', async () => {
        await store.dispatch('onboarding/beforeOpenWidgetConfig');
        expect(asyncTimeout).toHaveBeenCalledWith(300);
      });
    });

    describe('beforeOpenGaleryEmptyConfig', () => {
      beforeEach(() => {
        vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
          if (selector === '[data-onboarding-id="drawer-graph-empty"]') {
            return { id: 'mock-ref' };
          }

          if (selector === '[data-onboarding-id="widget-gallery"]') {
            return { id: 'mock-ref' };
          }

          return null;
        });
      });

      it('should click on graph empty button if galeryDrawer is undefined', async () => {
        const mockGraphEmptyButton = { click: vi.fn() };
        vi.spyOn(document, 'querySelector').mockImplementationOnce(() => null);
        store.commit('onboarding/SET_ONBOARDING_REF', {
          key: 'widget-graph-empty',
          ref: { querySelector: vi.fn().mockReturnValue(mockGraphEmptyButton) },
        });

        await store.dispatch('onboarding/beforeOpenGaleryEmptyConfig');
        expect(mockGraphEmptyButton.click).toHaveBeenCalled();
      });

      it('should commit SET_ONBOARDING_REF mutation with correct key and ref', async () => {
        await store.dispatch('onboarding/beforeOpenGaleryEmptyConfig');
        expect(store.state.onboarding.onboardingRefs).toMatchObject({
          'widget-gallery': { id: 'mock-ref' },
        });
      });

      it('should call asyncTimeout with 300ms', async () => {
        await store.dispatch('onboarding/beforeOpenGaleryEmptyConfig');
        expect(asyncTimeout).toHaveBeenCalledWith(300);
      });
    });

    describe('beforeOpenEmptyWidgetConfig', () => {
      beforeEach(() => {
        vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
          if (selector === '[data-onboarding-id="drawer-graph-empty"]') {
            return { id: 'mock-ref', children: [{ id: 'mock-ref' }] };
          }

          if (selector === '[data-onboarding-id="widget-gallery"]') {
            return { id: 'mock-ref' };
          }

          return null;
        });
      });

      it('should click on graph empty button if galeryDrawer is undefined', async () => {
        const mockGraphEmptyButton = { click: vi.fn() };
        vi.spyOn(document, 'querySelector').mockImplementationOnce(() => null);
        store.commit('onboarding/SET_ONBOARDING_REF', {
          key: 'widget-graph-empty',
          ref: { querySelector: vi.fn().mockReturnValue(mockGraphEmptyButton) },
        });
        await store.dispatch('onboarding/beforeOpenEmptyWidgetConfig');
        expect(mockGraphEmptyButton.click).toHaveBeenCalled();
      });

      it('should commit SET_ONBOARDING_REF mutation with correct key and ref', async () => {
        await store.dispatch('onboarding/beforeOpenEmptyWidgetConfig');
        expect(store.state.onboarding.onboardingRefs).toMatchObject({
          'widget-gallery': { id: 'mock-ref' },
        });
      });

      it('should call asyncTimeout with 600ms', async () => {
        await store.dispatch('onboarding/beforeOpenEmptyWidgetConfig');
        expect(asyncTimeout).toHaveBeenCalledWith(600);
      });
    });

    describe('beforeOpenWidgetMetricConfig', () => {
      beforeEach(() => {
        vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
          if (selector === '[data-onboarding-id="drawer-card-metric-config"]') {
            return {
              id: 'mock-ref',
              children: [{ id: 'mock-ref-1' }, { id: 'mock-ref-2' }],
            };
          }
          return null;
        });
      });

      it('should commit SET_ONBOARDING_REF mutation with correct key and ref', async () => {
        await store.dispatch('onboarding/beforeOpenWidgetMetricConfig');
        expect(store.state.onboarding.onboardingRefs).toMatchObject({
          'drawer-card-metric-config': { id: 'mock-ref-2' },
        });
      });

      it('should call asyncTimeout with 600ms', async () => {
        await store.dispatch('onboarding/beforeOpenEmptyWidgetConfig');
        expect(asyncTimeout).toHaveBeenCalledWith(600);
      });
    });
  });
});
