import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import WidgetOnboarding from '../WidgetOnboarding.vue';

import { useOnboarding } from '@/store/modules/onboarding';
import { useWidgets } from '@/store/modules/widgets';

// Mock UnnnicTour component
const UnnnicTourStub = {
  name: 'UnnnicTour',
  template: '<div class="unnnic-tour-stub">{{ steps }}</div>',
  props: ['steps'],
  methods: {
    start: vi.fn(),
  },
  emits: ['end-tour', 'close'],
};

describe('WidgetOnboarding', () => {
  let wrapper;

  let onboardingStore;
  let widgetsStore;

  const createWrapper = (props = {}, options = {}) => {
    return shallowMount(WidgetOnboarding, {
      props: {
        showCardTour: true,
        showWidgetTour: true,
        ...props,
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
        mocks: {
          $t: (key) => key,
        },
        stubs: {
          UnnnicTour: UnnnicTourStub,
        },
      },
      ...options,
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();

    document.querySelector = vi.fn(() => {
      const element = document.createElement('div');
      return element;
    });

    wrapper = createWrapper();

    onboardingStore = useOnboarding();
    widgetsStore = useWidgets();

    // Set up default store values
    onboardingStore.onboardingRefs = {
      'widgets-onboarding-tour': {
        start: vi.fn(),
      },
    };
    widgetsStore.currentDashboardWidgets = [];
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Component Structure', () => {
    it('should render UnnnicTour component', () => {
      expect(wrapper.findComponent({ name: 'UnnnicTour' }).exists()).toBe(true);
    });

    it('should pass steps prop to UnnnicTour', () => {
      const unnnicTour = wrapper.findComponent({ name: 'UnnnicTour' });
      expect(unnnicTour.props('steps')).toBeDefined();
      expect(Array.isArray(unnnicTour.props('steps'))).toBe(true);
    });
  });

  describe('Props Validation', () => {
    it('should have required showCardTour prop', () => {
      expect(WidgetOnboarding.props.showCardTour.required).toBe(true);
      expect(WidgetOnboarding.props.showCardTour.type).toBe(Boolean);
    });

    it('should have required showWidgetTour prop', () => {
      expect(WidgetOnboarding.props.showWidgetTour.required).toBe(true);
      expect(WidgetOnboarding.props.showWidgetTour.type).toBe(Boolean);
    });
  });

  describe('Computed Properties', () => {
    describe('hasCardWidget', () => {
      it('should return true when there is a card widget', () => {
        widgetsStore.currentDashboardWidgets = [
          { type: 'card' },
          { type: 'graph' },
        ];
        expect(wrapper.vm.hasCardWidget).toBe(true);
      });

      it('should return false when there is no card widget', () => {
        widgetsStore.currentDashboardWidgets = [
          { type: 'graph' },
          { type: 'table' },
        ];
        expect(wrapper.vm.hasCardWidget).toBe(false);
      });

      it('should return false when widgets array is empty', () => {
        widgetsStore.currentDashboardWidgets = [];
        expect(wrapper.vm.hasCardWidget).toBe(false);
      });
    });

    describe('widgetsOnboardingSteps', () => {
      it('should return an array', () => {
        const steps = wrapper.vm.widgetsOnboardingSteps;
        expect(Array.isArray(steps)).toBe(true);
      });

      it('should return empty array when both props are false', () => {
        const wrapper = createWrapper({
          showCardTour: false,
          showWidgetTour: false,
        });
        const steps = wrapper.vm.widgetsOnboardingSteps;
        expect(steps.length).toBe(0);
      });
    });
  });

  describe('Event Handling', () => {
    it('should handle end-tour event', async () => {
      const setShowConfigWidgetsOnboardingSpy = vi.spyOn(
        onboardingStore,
        'setShowConfigWidgetsOnboarding',
      );

      const unnnicTour = wrapper.findComponent({ name: 'UnnnicTour' });
      await unnnicTour.vm.$emit('end-tour');

      expect(setShowConfigWidgetsOnboardingSpy).toHaveBeenCalledWith(false);
    });

    it('should handle close event', async () => {
      const setShowConfigWidgetsOnboardingSpy = vi.spyOn(
        onboardingStore,
        'setShowConfigWidgetsOnboarding',
      );

      const unnnicTour = wrapper.findComponent({ name: 'UnnnicTour' });
      await unnnicTour.vm.$emit('close');

      expect(setShowConfigWidgetsOnboardingSpy).toHaveBeenCalledWith(false);
    });
  });

  describe('Store Integration', () => {
    it('should use dashboards store correctly', () => {
      expect(wrapper.vm.currentDashboard).toBeDefined();
    });

    it('should use widgets store correctly', () => {
      expect(wrapper.vm.currentDashboardWidgets).toBeDefined();
    });

    it('should use onboarding store correctly', () => {
      expect(wrapper.vm.onboardingRefs).toBeDefined();
      expect(wrapper.vm.showConfigWidgetOnboarding).toBeDefined();
    });
  });
});
