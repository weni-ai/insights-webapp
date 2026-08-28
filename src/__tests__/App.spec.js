import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createRouter, createMemoryHistory } from 'vue-router';

import App from '@/App.vue';

import { useDashboards } from '@/store/modules/dashboards';
import { useConfig } from '@/store/modules/config';
import { useOnboarding } from '@/store/modules/onboarding';
import { useProject } from '@/store/modules/project';
import { useUser } from '@/store/modules/user';
import { useFeatureFlag } from '@/store/modules/featureFlag';
import moment from 'moment';

const { sharedStoreState, useSharedStore } = vi.hoisted(() => {
  const sharedStoreState = {
    auth: {
      token: 'mock-token',
    },
    user: {
      language: null,
    },
    current: {
      project: null,
    },
    activeFederatedModules: {
      insights: undefined,
    },
  };

  const useSharedStore = vi.fn(() => sharedStoreState);

  return { sharedStoreState, useSharedStore };
});

vi.mock('@/utils/moduleFederation', () => ({
  isFederatedModule: true,
  safeImport: vi.fn(async () => ({
    useSharedStore,
  })),
  safeAsyncComponent: vi.fn(),
}));

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
    getProjectSource: vi.fn(),
    verifyProjectCsat: vi.fn(() => ({ is_enabled: true })),
    verifyProjectAbandonedCartRecovery: vi.fn(() =>
      Promise.resolve({ active: false }),
    ),
    getMarketingTemplateCost: vi.fn(() => Promise.resolve({ value: 0 })),
    getProjectInfo: vi.fn(() =>
      Promise.resolve({ uuid: 'query-project-uuid', name: 'Test Project' }),
    ),
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
  CompleteOnboardingModal: {
    name: 'CompleteOnboardingModal',
    template: '<div class="complete-onboarding-modal"></div>',
    props: ['showModal'],
    emits: ['finish-onboarding'],
  },
  McpNewsModal: {
    name: 'McpNewsModal',
    template: '<div class="mcp-news-modal" data-testid="mcp-news-modal"></div>',
    props: ['modelValue'],
    emits: ['not-now', 'view-guide', 'update:modelValue'],
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

  const createTestRouter = () =>
    createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        {
          path: '/human-service',
          name: 'humanServiceDashboard',
          component: { template: '<div />' },
        },
        {
          path: '/:dashboardUuid?',
          name: 'dashboard',
          component: { template: '<div />' },
        },
      ],
    });

  const createWrapper = (options = {}) => {
    return mount(App, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
          }),
          createTestRouter(),
        ],
        components: mockComponents,
        stubs: {
          RouterView: mockComponents.RouterView,
          InsightsLayout: mockComponents.InsightsLayout,
          IconLoading: mockComponents.IconLoading,
          CompleteOnboardingModal: mockComponents.CompleteOnboardingModal,
          McpNewsModal: mockComponents.McpNewsModal,
        },
      },
      ...options,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    sharedStoreState.user = { language: null };
    sharedStoreState.current = { project: null };
    sharedStoreState.activeFederatedModules = { insights: undefined };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    Object.defineProperty(global, 'URLSearchParams', {
      value: mockURLSearchParams,
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
      const getFeatureFlagsSpy = vi.spyOn(featureFlagStore, 'getFeatureFlags');

      dashboardsStore.currentDashboard = { uuid: 'new-uuid' };
      await flushPromises();

      expect(setCurrentDashboardFiltersSpy).toHaveBeenCalledWith([]);
      expect(getCurrentDashboardFiltersSpy).toHaveBeenCalled();
      expect(getFeatureFlagsSpy).toHaveBeenCalled();
    });

    it('should not trigger actions when currentDashboard.uuid is null', async () => {
      dashboardsStore.currentDashboard = { uuid: 'existing-uuid' };
      await flushPromises();

      const setCurrentDashboardFiltersSpy = vi.spyOn(
        dashboardsStore,
        'setCurrentDashboardFilters',
      );
      const getCurrentDashboardFiltersSpy = vi.spyOn(
        dashboardsStore,
        'getCurrentDashboardFilters',
      );
      const getFeatureFlagsSpy = vi.spyOn(featureFlagStore, 'getFeatureFlags');

      dashboardsStore.currentDashboard = { uuid: null };
      await flushPromises();

      expect(setCurrentDashboardFiltersSpy).not.toHaveBeenCalled();
      expect(getCurrentDashboardFiltersSpy).not.toHaveBeenCalled();
      expect(getFeatureFlagsSpy).not.toHaveBeenCalled();
    });

    it('should set language when sharedStore user language changes', async () => {
      wrapper.unmount();
      sharedStoreState.user = { language: 'pt-br' };
      wrapper = createWrapper();
      await flushPromises();

      expect(moment.locale).toHaveBeenCalledWith('pt-br');
    });

    it('should set project and commerce when sharedStore project changes', async () => {
      wrapper.unmount();
      sharedStoreState.current = {
        project: {
          uuid: 'shared-project-uuid',
          type: 2,
        },
      };

      const pinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
      });
      configStore = useConfig(pinia);
      projectStore = useProject(pinia);

      const setProjectSpy = vi.spyOn(configStore, 'setProject');
      const loadProjectInfoSpy = vi.spyOn(configStore, 'loadProjectInfo');
      const setIsCommerceSpy = vi.spyOn(projectStore, 'setIsCommerce');

      wrapper = mount(App, {
        global: {
          plugins: [pinia, createTestRouter()],
          components: mockComponents,
          stubs: {
            RouterView: mockComponents.RouterView,
            InsightsLayout: mockComponents.InsightsLayout,
            IconLoading: mockComponents.IconLoading,
            CompleteOnboardingModal: mockComponents.CompleteOnboardingModal,
            McpNewsModal: mockComponents.McpNewsModal,
          },
        },
      });
      await flushPromises();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'insights_projectUuid',
        'shared-project-uuid',
      );
      expect(setProjectSpy).toHaveBeenCalledWith({
        uuid: 'shared-project-uuid',
      });
      expect(loadProjectInfoSpy).toHaveBeenCalled();
      expect(setIsCommerceSpy).toHaveBeenCalledWith(true);
    });

    it('should set isCommerce to false when project type is not commerce', async () => {
      wrapper.unmount();
      sharedStoreState.current = {
        project: {
          uuid: 'shared-project-uuid',
          type: 1,
        },
      };

      const pinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
      });
      projectStore = useProject(pinia);
      const setIsCommerceSpy = vi.spyOn(projectStore, 'setIsCommerce');

      wrapper = mount(App, {
        global: {
          plugins: [pinia, createTestRouter()],
          components: mockComponents,
          stubs: {
            RouterView: mockComponents.RouterView,
            InsightsLayout: mockComponents.InsightsLayout,
            IconLoading: mockComponents.IconLoading,
            CompleteOnboardingModal: mockComponents.CompleteOnboardingModal,
            McpNewsModal: mockComponents.McpNewsModal,
          },
        },
      });
      await flushPromises();

      expect(setIsCommerceSpy).toHaveBeenCalledWith(false);
    });

    it('should set isActiveRoute when activeFederatedModules.insights changes', async () => {
      wrapper.unmount();
      sharedStoreState.activeFederatedModules = { insights: true };

      const pinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
      });
      configStore = useConfig(pinia);
      const setIsActiveRouteSpy = vi.spyOn(configStore, 'setIsActiveRoute');

      wrapper = mount(App, {
        global: {
          plugins: [pinia, createTestRouter()],
          components: mockComponents,
          stubs: {
            RouterView: mockComponents.RouterView,
            InsightsLayout: mockComponents.InsightsLayout,
            IconLoading: mockComponents.IconLoading,
            CompleteOnboardingModal: mockComponents.CompleteOnboardingModal,
            McpNewsModal: mockComponents.McpNewsModal,
          },
        },
      });
      await flushPromises();

      expect(setIsActiveRouteSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('Lifecycle Methods', () => {
    it('should load project info after token and uuid are set', async () => {
      wrapper.unmount();

      const pinia = createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
      });
      const isolatedConfigStore = useConfig(pinia);
      const loadProjectInfoSpy = vi.spyOn(
        isolatedConfigStore,
        'loadProjectInfo',
      );

      wrapper = mount(App, {
        global: {
          plugins: [pinia, createTestRouter()],
          components: mockComponents,
          stubs: {
            RouterView: mockComponents.RouterView,
            InsightsLayout: mockComponents.InsightsLayout,
            IconLoading: mockComponents.IconLoading,
            CompleteOnboardingModal: mockComponents.CompleteOnboardingModal,
            McpNewsModal: mockComponents.McpNewsModal,
          },
        },
      });

      await flushPromises();

      expect(loadProjectInfoSpy).toHaveBeenCalled();
      expect(isolatedConfigStore.project).toEqual({
        uuid: 'query-project-uuid',
        name: 'Test Project',
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
      await flushPromises();

      expect(
        wrapper.findComponent('[data-testid="insights-layout"]').exists(),
      ).toBe(true);
    });

    it('should show IconLoading when dashboard filters are loading', async () => {
      dashboardsStore.isLoadingDashboards = false;
      dashboardsStore.dashboards = [{ id: 1 }];
      dashboardsStore.isLoadingCurrentDashboardFilters = true;
      await flushPromises();

      expect(
        wrapper.findComponent('[data-testid="icon-loading"]').exists(),
      ).toBe(true);
    });

    it('should show RouterView when not loading filters', async () => {
      dashboardsStore.isLoadingDashboards = false;
      dashboardsStore.dashboards = [{ id: 1 }];
      dashboardsStore.isLoadingCurrentDashboardFilters = false;
      await flushPromises();

      expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true);
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

  describe('MCP News Modal', () => {
    it('should render McpNewsModal when mcp_news_modal_seen is not in storage', async () => {
      await wrapper.vm.$nextTick();

      const modal = wrapper.findComponent('[data-testid="mcp-news-modal"]');
      expect(modal.exists()).toBe(true);
    });

    it('should not render McpNewsModal when mcp_news_modal_seen is set', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        const items = {
          insights_token: 'mock-token',
          insights_projectUuid: 'stored-project-uuid',
          insights_mcp_news_modal_seen: 'true',
        };
        return items[key] || null;
      });

      wrapper = createWrapper();
      const modal = wrapper.find('[data-testid="mcp-news-modal"]');
      expect(modal.exists()).toBe(false);
    });

    it('should handle not-now event by setting localStorage and hiding modal', async () => {
      const modal = wrapper.findComponent('[data-testid="mcp-news-modal"]');
      await modal.vm.$emit('not-now');
      await wrapper.vm.$nextTick();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'insights_mcp_news_modal_seen',
        'true',
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'insights_mcp_news_show_disclaimer',
        'true',
      );
      expect(
        wrapper.findComponent('[data-testid="mcp-news-modal"]').exists(),
      ).toBe(false);
    });

    it('should handle view-guide event by setting localStorage and hiding modal', async () => {
      const modal = wrapper.findComponent('[data-testid="mcp-news-modal"]');
      await modal.vm.$emit('view-guide');
      await wrapper.vm.$nextTick();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'insights_mcp_news_modal_seen',
        'true',
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'insights_mcp_news_show_disclaimer',
        'false',
      );
      expect(
        wrapper.findComponent('[data-testid="mcp-news-modal"]').exists(),
      ).toBe(false);
    });
  });
});
