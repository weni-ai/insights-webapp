import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import App from '@/App.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useConfig } from '@/store/modules/config';
import { useOnboarding } from '@/store/modules/onboarding';
import { useProject } from '@/store/modules/project';
import { useUser } from '@/store/modules/user';
import { useFeatureFlag } from '@/store/modules/featureFlag';

vi.mock('@/services/api', () => {
  return {
    Dashboards: {
      getDashboardFilters: vi.fn(),
      getAll: vi.fn(() => ({
        dashboards: [{ uuid: 'uuid', name: 'dashboard-name' }],
      })),
    },
  };
});

vi.mock('@/services/api/resources/projects', () => ({
  default: {
    verifyProjectIndexer: vi.fn(),
    verifyProjectCsat: vi.fn(() => ({ is_enabled: true })),
  },
}));

vi.mock('@/utils/plugins/Hotjar', () => ({
  default: vi.fn(),
}));

vi.mock('@/utils/jwt', () => ({
  parseJwt: vi.fn(() => ({ email: 'test@example.com' })),
}));

vi.mock('moment', () => ({
  default: {
    locale: vi.fn(),
  },
}));

const mockComponents = {
  InsightsLayout: {
    name: 'InsightsLayout',
    template: '<div class="insights-layout"><slot /></div>',
  },
  IconLoading: {
    name: 'IconLoading',
    template: '<div class="icon-loading">Loading...</div>',
  },
  WelcomeOnboardingModal: {
    name: 'WelcomeOnboardingModal',
    template: '<div class="welcome-onboarding-modal"></div>',
    props: ['showModal'],
    emits: ['close', 'start-onboarding'],
  },
  CompleteOnboardingModal: {
    name: 'CompleteOnboardingModal',
    template: '<div class="complete-onboarding-modal"></div>',
    props: ['showModal'],
    emits: ['finish-onboarding'],
  },
  DashboardOnboarding: {
    name: 'DashboardOnboarding',
    template: '<div class="dashboard-onboarding"></div>',
  },
  RouterView: {
    name: 'RouterView',
    template: '<div class="router-view"></div>',
  },
};

describe('App', () => {
  let wrapper;
  let dashboardsStore;
  let configStore;
  let onboardingStore;
  let projectStore;
  let featureFlagStore;

  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  const mockURLSearchParams = vi.fn().mockImplementation(() => ({
    get: vi.fn(),
  }));

  const mockPostMessage = vi.fn();
  const mockAddEventListener = vi.fn();

  const createWrapper = (options = {}) => {
    return mount(App, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
          }),
        ],
        components: mockComponents,
        mocks: {
          $i18n: {
            locale: 'en',
          },
          ...options.mocks,
        },
        stubs: {
          RouterView: mockComponents.RouterView,
        },
      },
      ...options,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    Object.defineProperty(global, 'URLSearchParams', {
      value: mockURLSearchParams,
      writable: true,
    });

    Object.defineProperty(window, 'parent', {
      value: {
        postMessage: mockPostMessage,
      },
      writable: true,
    });

    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: {
        search: '?projectUuid=test-project-uuid',
      },
      writable: true,
    });

    localStorageMock.getItem.mockImplementation((key) => {
      const items = {
        insights_token: 'mock-token',
        insights_projectUuid: 'stored-project-uuid',
        insights_hasDashboardOnboardingComplete: 'false',
      };
      return items[key] || null;
    });

    mockURLSearchParams.mockImplementation(() => ({
      get: vi.fn((key) => {
        if (key === 'projectUuid') return 'query-project-uuid';
        return null;
      }),
    }));

    wrapper = createWrapper();

    dashboardsStore = useDashboards();
    configStore = useConfig();
    onboardingStore = useOnboarding();
    projectStore = useProject();
    featureFlagStore = useFeatureFlag();
    useUser();

    dashboardsStore.dashboards = [];
    dashboardsStore.isLoadingDashboards = false;
    dashboardsStore.isLoadingCurrentDashboardFilters = false;
    dashboardsStore.currentDashboard = { uuid: null };
    onboardingStore.showCreateDashboardOnboarding = false;
    onboardingStore.showCompleteOnboardingModal = false;
    configStore.token = null;
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  describe('Computed Properties', () => {
    it('should map dashboards store state correctly', () => {
      dashboardsStore.dashboards = [{ id: 1, name: 'Test Dashboard' }];
      dashboardsStore.isLoadingDashboards = true;
      dashboardsStore.isLoadingCurrentDashboardFilters = true;
      dashboardsStore.currentDashboard = { uuid: 'test-uuid' };

      expect(wrapper.vm.dashboards).toEqual([
        { id: 1, name: 'Test Dashboard' },
      ]);
      expect(wrapper.vm.isLoadingDashboards).toBe(true);
      expect(wrapper.vm.isLoadingCurrentDashboardFilters).toBe(true);
      expect(wrapper.vm.currentDashboard).toEqual({ uuid: 'test-uuid' });
    });

    it('should map config store state correctly', () => {
      configStore.token = 'test-token';
      expect(wrapper.vm.token).toBe('test-token');
    });

    it('should map onboarding store state correctly', () => {
      onboardingStore.showCreateDashboardOnboarding = true;
      onboardingStore.showCompleteOnboardingModal = true;

      expect(wrapper.vm.showCreateDashboardTour).toBe(true);
      expect(wrapper.vm.showCompleteOnboardingModal).toBe(true);
    });
  });

  describe('Watchers', () => {
    it('should watch currentDashboard.uuid changes', async () => {
      const setCurrentDashboardFiltersSpy = vi.spyOn(
        dashboardsStore,
        'setCurrentDashboardFilters',
      );
      const getCurrentDashboardFiltersSpy = vi.spyOn(
        dashboardsStore,
        'getCurrentDashboardFilters',
      );
      const getFeatureFlagsSpy = vi.spyOn(wrapper.vm, 'getFeatureFlags');

      const newUuid = 'new-uuid';
      await wrapper.vm.$options.watch['currentDashboard.uuid'].call(
        wrapper.vm,
        newUuid,
      );

      expect(setCurrentDashboardFiltersSpy).toHaveBeenCalledWith([]);
      expect(getCurrentDashboardFiltersSpy).toHaveBeenCalled();
      expect(getFeatureFlagsSpy).toHaveBeenCalled();
    });

    it('should not trigger actions when currentDashboard.uuid is null', async () => {
      const setCurrentDashboardFiltersSpy = vi.spyOn(
        dashboardsStore,
        'setCurrentDashboardFilters',
      );
      const getCurrentDashboardFiltersSpy = vi.spyOn(
        dashboardsStore,
        'getCurrentDashboardFilters',
      );
      const getFeatureFlagsSpy = vi.spyOn(wrapper.vm, 'getFeatureFlags');

      await wrapper.vm.$options.watch['currentDashboard.uuid'].call(
        wrapper.vm,
        null,
      );

      expect(setCurrentDashboardFiltersSpy).not.toHaveBeenCalled();
      expect(getCurrentDashboardFiltersSpy).not.toHaveBeenCalled();
      expect(getFeatureFlagsSpy).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle Methods', () => {
    it('should call listenConnect on created', () => {
      const listenConnectSpy = vi.spyOn(App.methods, 'listenConnect');
      createWrapper();
      expect(listenConnectSpy).toHaveBeenCalled();
    });
  });

  describe('Methods', () => {
    describe('getFeatureFlags action mapping', () => {
      it('should have getFeatureFlags method mapped from featureFlag store', () => {
        expect(typeof wrapper.vm.getFeatureFlags).toBe('function');
      });

      it('should call featureFlag store getFeatureFlags when method is invoked', async () => {
        const getFeatureFlagsSpy = vi.spyOn(
          featureFlagStore,
          'getFeatureFlags',
        );

        await wrapper.vm.getFeatureFlags();

        expect(getFeatureFlagsSpy).toHaveBeenCalled();
      });
    });

    describe('handlerSetProject', () => {
      it('should set project in moduleStorage and store', () => {
        const setProjectSpy = vi.spyOn(configStore, 'setProject');

        wrapper.vm.handlerSetProject('new-project-uuid');

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'insights_projectUuid',
          'new-project-uuid',
        );
        expect(setProjectSpy).toHaveBeenCalledWith({
          uuid: 'new-project-uuid',
        });
      });
    });

    describe('handlerSetIsCommerce', () => {
      it('should set isCommerce in project store', () => {
        const setIsCommerceSpy = vi.spyOn(projectStore, 'setIsCommerce');

        wrapper.vm.handlerSetIsCommerce(true);

        expect(setIsCommerceSpy).toHaveBeenCalledWith(true);
      });
    });

    describe('listenConnect', () => {
      it('should post messages to parent window', () => {
        wrapper.vm.listenConnect();

        expect(mockPostMessage).toHaveBeenCalledWith(
          { event: 'getLanguage' },
          '*',
        );
        expect(mockPostMessage).toHaveBeenCalledWith(
          { event: 'getIsCommerce' },
          '*',
        );
      });

      it('should add event listener for messages', () => {
        wrapper.vm.listenConnect();

        expect(mockAddEventListener).toHaveBeenCalledWith(
          'message',
          expect.any(Function),
        );
      });
    });

    describe('getEventHandler', () => {
      it('should return correct handler for setLanguage event', () => {
        const result = wrapper.vm.getEventHandler('setLanguage');

        expect(result.handler).toBe(wrapper.vm.handlerSetLanguage);
        expect(result.dataKey).toBe('language');
      });

      it('should return correct handler for setProject event', () => {
        const result = wrapper.vm.getEventHandler('setProject');

        expect(result.handler).toBe(wrapper.vm.handlerSetProject);
        expect(result.dataKey).toBe('projectUuid');
      });

      it('should return correct handler for setIsCommerce event', () => {
        const result = wrapper.vm.getEventHandler('setIsCommerce');

        expect(result.handler).toBe(wrapper.vm.handlerSetIsCommerce);
        expect(result.dataKey).toBe('isCommerce');
      });

      it('should return undefined for unknown event', () => {
        const result = wrapper.vm.getEventHandler('unknownEvent');

        expect(result.handler).toBeUndefined();
        expect(result.dataKey).toBeUndefined();
      });
    });

    describe('handlerShowOnboardingModal', () => {
      it('should not show modal when custom dashboard exists', () => {
        dashboardsStore.dashboards = [
          { id: 1, is_deletable: true },
          { id: 2, is_deletable: false },
        ];

        wrapper.vm.handlerShowOnboardingModal();

        expect(wrapper.vm.showOnboardingModal).toBe(false);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'insights_hasDashboardOnboardingComplete',
          'true',
        );
      });

      it('should show modal when no custom dashboard, enableCreateCustomDashboards is true and onboarding not complete', () => {
        dashboardsStore.dashboards = [{ id: 1, is_deletable: false }];
        localStorageMock.getItem.mockImplementation((key) => {
          if (key === 'insights_hasDashboardOnboardingComplete') return null;
          return null;
        });
        configStore.enableCreateCustomDashboards = true;

        wrapper.vm.handlerShowOnboardingModal();

        expect(wrapper.vm.showOnboardingModal).toBe(true);
      });

      it('should not show modal when onboarding is complete', () => {
        dashboardsStore.dashboards = [{ id: 1, is_deletable: false }];
        localStorageMock.getItem.mockImplementation((key) => {
          if (key === 'insights_hasDashboardOnboardingComplete') return 'true';
          return null;
        });

        wrapper.vm.handlerShowOnboardingModal();

        expect(wrapper.vm.showOnboardingModal).toBe(false);
      });
    });

    describe('handlerStartOnboarding', () => {
      it('should close onboarding modal and start dashboard onboarding', () => {
        const setShowCreateDashboardOnboardingSpy = vi.spyOn(
          onboardingStore,
          'setShowCreateDashboardOnboarding',
        );

        wrapper.vm.handlerStartOnboarding();

        expect(wrapper.vm.showOnboardingModal).toBe(false);
        expect(setShowCreateDashboardOnboardingSpy).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Conditional Rendering', () => {
    it('should show loading container when dashboards are loading', async () => {
      dashboardsStore.isLoadingDashboards = true;
      await wrapper.vm.$nextTick();

      expect(
        wrapper.find('[data-testid="loading-container-dashboards"]').exists(),
      ).toBe(true);
    });

    it('should show InsightsLayout when dashboards exist and not loading', async () => {
      dashboardsStore.isLoadingDashboards = false;
      dashboardsStore.dashboards = [{ id: 1, name: 'Test Dashboard' }];
      await wrapper.vm.$nextTick();

      expect(
        wrapper.findComponent('[data-testid="insights-layout"]').exists(),
      ).toBe(true);
    });

    it('should show IconLoading when dashboard filters are loading', async () => {
      dashboardsStore.isLoadingDashboards = false;
      dashboardsStore.dashboards = [{ id: 1 }];
      dashboardsStore.isLoadingCurrentDashboardFilters = true;
      await wrapper.vm.$nextTick();

      expect(
        wrapper.findComponent('[data-testid="icon-loading"]').exists(),
      ).toBe(true);
    });

    it('should show RouterView when not loading filters', async () => {
      dashboardsStore.isLoadingDashboards = false;
      dashboardsStore.dashboards = [{ id: 1 }];
      dashboardsStore.isLoadingCurrentDashboardFilters = false;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true);
    });

    it('should show DashboardOnboarding when showCreateDashboardTour is true', async () => {
      onboardingStore.showCreateDashboardOnboarding = true;
      await wrapper.vm.$nextTick();

      expect(
        wrapper.findComponent('[data-testid="dashboard-onboarding"]').exists(),
      ).toBe(true);
    });
  });

  describe('Modal Components', () => {
    it('should render CompleteOnboardingModal with correct props', async () => {
      onboardingStore.showCompleteOnboardingModal = true;
      await wrapper.vm.$nextTick();

      const modal = wrapper.findComponent(
        '[class="complete-onboarding-modal"]',
      );
      expect(modal.exists()).toBe(true);
      expect(modal.props('showModal')).toBe(true);
    });

    it('should handle WelcomeOnboardingModal close event', async () => {
      wrapper.vm.showOnboardingModal = true;
      await wrapper.vm.$nextTick();

      const modal = wrapper.findComponent(
        '[data-testid="welcome-onboarding-modal"]',
      );
      await modal.vm.$emit('close');

      expect(wrapper.vm.showOnboardingModal).toBe(false);
    });

    it('should handle WelcomeOnboardingModal start-onboarding event', async () => {
      const handlerStartOnboardingSpy = vi.spyOn(
        wrapper.vm,
        'handlerStartOnboarding',
      );
      wrapper.vm.showOnboardingModal = true;
      await wrapper.vm.$nextTick();

      const modal = wrapper.findComponent(
        '[data-testid="welcome-onboarding-modal"]',
      );
      await modal.vm.$emit('start-onboarding');

      expect(handlerStartOnboardingSpy).toHaveBeenCalled();
    });

    it('should handle CompleteOnboardingModal finish-onboarding event', async () => {
      const setShowCompleteOnboardingModalSpy = vi.spyOn(
        onboardingStore,
        'setShowCompleteOnboardingModal',
      );
      onboardingStore.showCompleteOnboardingModal = true;
      await wrapper.vm.$nextTick();

      const modal = wrapper.findComponent(
        '[data-testid="complete-onboarding-modal"]',
      );
      await modal.vm.$emit('finish-onboarding');

      expect(setShowCompleteOnboardingModalSpy).toHaveBeenCalledWith(false);
    });
  });
});
