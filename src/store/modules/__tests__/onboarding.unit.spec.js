import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useOnboarding } from '../onboarding';

vi.mock('@/utils/time', () => ({
  asyncTimeout: vi.fn(() => Promise.resolve()),
}));

describe('useOnboarding store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useOnboarding();
  });

  it('should initialize with default values', () => {
    expect(store.showCreateDashboardOnboarding).toBe(false);
    expect(store.showConfigWidgetOnboarding).toBe(false);
    expect(store.showCompleteOnboardingModal).toBe(false);
    expect(store.onboardingRefs['select-dashboard']).toBeNull();
  });

  it('should set flags correctly', () => {
    store.setShowCreateDashboardOnboarding(true);
    store.setShowConfigWidgetsOnboarding(true);
    store.setShowCompleteOnboardingModal(true);

    expect(store.showCreateDashboardOnboarding).toBe(true);
    expect(store.showConfigWidgetOnboarding).toBe(true);
    expect(store.showCompleteOnboardingModal).toBe(true);
  });

  it('should update onboardingRefs via setOnboardingRef', () => {
    const fakeElement = {};
    store.setOnboardingRef({ key: 'widget-card-metric', ref: fakeElement });
    expect(store.onboardingRefs['widget-card-metric']).toStrictEqual(
      fakeElement,
    );
  });

  it('should call nextStep in callTourNextStep if condition met', () => {
    const nextStep = vi.fn();
    store.setShowCreateDashboardOnboarding(true);
    store.setOnboardingRef({
      key: 'dashboard-onboarding-tour',
      ref: { nextStep },
    });

    store.callTourNextStep('dashboard-onboarding-tour');
    expect(nextStep).toHaveBeenCalled();
  });

  it('should call handleStep in callTourPreviousStep if condition met', async () => {
    const handleStep = vi.fn();
    store.setShowConfigWidgetsOnboarding(true);
    store.setOnboardingRef({
      key: 'widgets-onboarding-tour',
      ref: { currentStep: 2, handleStep },
    });

    await store.callTourPreviousStep({
      tour: 'widgets-onboarding-tour',
      qtdSteps: 1,
    });
    expect(handleStep).toHaveBeenCalledWith(1);
  });

  // DOM-based methods like beforeOpenDashboardList would require integration tests or jsdom setup
  // Here's an example using mock implementation
  it('should not throw when beforeOpenDashboardList is called', async () => {
    store.setShowCreateDashboardOnboarding(true);
    global.document.querySelector = vi.fn().mockReturnValue({ click: vi.fn() });

    await store.beforeOpenDashboardList();
    expect(document.querySelector).toHaveBeenCalled();
  });

  it('should handle beforeOpenWidgetConfig when config widget onboarding is active', async () => {
    store.setShowConfigWidgetsOnboarding(true);
    const mockClick = vi.fn();
    const mockQuerySelector = vi.fn().mockReturnValue({ click: mockClick });

    store.setOnboardingRef({
      key: 'widget-card-metric',
      ref: { querySelector: mockQuerySelector },
    });

    global.document.querySelector = vi.fn().mockReturnValue(null);

    await store.beforeOpenWidgetConfig();
    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle beforeOpenGaleryEmptyConfig', async () => {
    const mockClick = vi.fn();
    const mockQuerySelector = vi.fn().mockReturnValue({ click: mockClick });

    store.setOnboardingRef({
      key: 'widget-graph-empty',
      ref: { querySelector: mockQuerySelector },
    });

    global.document.querySelector = vi.fn().mockReturnValue(null);

    await store.beforeOpenGaleryEmptyConfig();
    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle beforeOpenEmptyWidgetConfig', async () => {
    const mockClick = vi.fn();
    const mockQuerySelector = vi.fn().mockReturnValue({ click: mockClick });

    store.setOnboardingRef({
      key: 'widget-graph-empty',
      ref: { querySelector: mockQuerySelector },
    });

    global.document.querySelector = vi.fn().mockReturnValue(null);

    await store.beforeOpenEmptyWidgetConfig();
    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle beforeOpenWidgetMetricConfig', async () => {
    const mockChildren = [{}, { someElement: true }];
    global.document.querySelector = vi
      .fn()
      .mockReturnValue({ children: mockChildren });

    await store.beforeOpenWidgetMetricConfig();
    expect(document.querySelector).toHaveBeenCalledWith(
      '.unnnic-drawer__container',
    );
  });
});
