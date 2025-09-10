import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import Header from '../Header.vue';
import { useDashboards } from '@/store/modules/dashboards';
import { useWidgets } from '@/store/modules/widgets';

import moment from 'moment';

// Mock do router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  currentRoute: {
    value: {
      name: 'dashboard',
      params: { dashboardUuid: 'dashboard-123' },
      path: '/dashboard/dashboard-123',
      query: {},
    },
  },
};

vi.mock('moment', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '2024-01-15'),
  })),
}));

describe('InsightsLayoutHeader.vue', () => {
  let wrapper;
  let dashboardsStore;
  let widgetsStore;

  const mockCurrentDashboard = {
    uuid: 'dashboard-123',
    name: 'human_service_dashboard.title',
    is_default: true,
  };

  const mockDashboards = [
    mockCurrentDashboard,
    {
      uuid: 'dashboard-456',
      name: 'commerce_dashboard.title',
      is_default: false,
    },
  ];

  const mockFilters = [
    {
      name: 'date_range',
      type: 'date_range',
      label: 'Date Range',
    },
    {
      name: 'sector',
      type: 'select',
      label: 'Sector',
    },
  ];

  const createWrapper = (options = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        dashboards: {
          dashboards: mockDashboards,
          currentDashboard: mockCurrentDashboard,
          dashboardDefault: mockCurrentDashboard,
          currentDashboardFilters: mockFilters,
          appliedFilters: {},
        },
        widgets: {
          currentExpansiveWidget: {},
        },
      },
    });

    return mount(Header, {
      global: {
        plugins: [pinia],
        mocks: {
          $router: mockRouter,
          $route: mockRouter.currentRoute.value,
          $t: (key) => key,
        },
        stubs: {
          UnnnicBreadcrumb: true,
          HeaderSelectDashboard: true,
          HeaderTagLive: true,
          InsightsLayoutHeaderFilters: true,
          HeaderDashboardSettings: true,
          HeaderGenerateInsightButton: true,
          UnnnicButtonIcon: true,
          HumanResourceExport: true,
        },
      },
      ...options,
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
    dashboardsStore = useDashboards();
    widgetsStore = useWidgets();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Rendering', () => {
    it('should render header when currentDashboard exists', () => {
      expect(
        wrapper.find('[data-testid="insights-layout-header"]').exists(),
      ).toBe(true);
    });

    it('should render breadcrumb when not in expansive mode', () => {
      expect(wrapper.findComponent({ name: 'UnnnicBreadcrumb' }).exists()).toBe(
        true,
      );
    });

    it('should render header content when not in expansive mode', () => {
      expect(
        wrapper.find('[data-testid="insights-layout-header-content"]').exists(),
      ).toBe(true);
      expect(
        wrapper.findComponent({ name: 'HeaderSelectDashboard' }).exists(),
      ).toBe(true);
    });

    it('should render expansive mode content when in expansive mode', async () => {
      widgetsStore.currentExpansiveWidget = {
        uuid: 'widget-123',
        name: 'Test Widget',
      };
      await nextTick();

      expect(
        wrapper
          .find('[data-testid="insights-layout-header-expansive"]')
          .exists(),
      ).toBe(true);
      expect(
        wrapper
          .find('[data-testid="insights-layout-header-expansive-title"]')
          .text(),
      ).toBe(wrapper.vm.$t('human_service_dashboard.all_agents'));
    });

    it('should render HeaderGenerateInsightButton for human service dashboard', () => {
      expect(
        wrapper
          .findComponent(
            '[data-testid="insights-layout-header-generate-insight-button"]',
          )
          .exists(),
      ).toBe(true);
    });

    it('should render HeaderTagLive when showTagLive is true', () => {
      expect(
        wrapper
          .findComponent('[data-testid="insights-layout-header-tag-live"]')
          .exists(),
      ).toBe(true);
    });

    it('should render InsightsLayoutHeaderFilters when filters exist', () => {
      expect(
        wrapper
          .findComponent('[data-testid="insights-layout-header-filters"]')
          .exists(),
      ).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    describe('isExpansiveMode', () => {
      it('should return false when currentExpansiveWidget is empty', () => {
        widgetsStore.currentExpansiveWidget = {};
        expect(wrapper.vm.isExpansiveMode).toBe(false);
      });

      it('should return true when currentExpansiveWidget has content', () => {
        widgetsStore.currentExpansiveWidget = { uuid: 'widget-123' };
        expect(wrapper.vm.isExpansiveMode).toBe(true);
      });
    });

    describe('isRenderInsightButton', () => {
      it('should return true for human service dashboard', () => {
        expect(wrapper.vm.isRenderInsightButton).toBe(true);
      });

      it('should return false for other dashboards', () => {
        dashboardsStore.currentDashboard = { name: 'other_dashboard.title' };
        expect(wrapper.vm.isRenderInsightButton).toBe(false);
      });
    });

    describe('breadcrumbs', () => {
      it('should return correct breadcrumbs for dashboard route', () => {
        const breadcrumbs = wrapper.vm.breadcrumbs;

        expect(breadcrumbs).toHaveLength(1);
        expect(breadcrumbs[0]).toEqual({
          path: 'dashboard-123',
          routeName: 'dashboard',
          name: `Insights ${wrapper.vm.$t('human_service_dashboard.title')}`,
        });
      });
    });

    describe('showTagLive', () => {
      beforeEach(() => {
        moment.mockReturnValue({
          format: vi.fn(() => '2024-01-15'),
        });
      });

      it('should return true when no date filter query exists', () => {
        wrapper.vm.$route.query = {};

        expect(wrapper.vm.showTagLive).toBe(true);
      });

      it('should return true when filtering by today', () => {
        dashboardsStore.appliedFilters = {
          date_range: {
            start: '2024-01-15',
            end: '2024-01-15',
          },
        };

        expect(wrapper.vm.showTagLive).toBe(true);
      });

      it('should return false when filtering by different date', () => {
        wrapper.vm.$route.query = { date_range: '2024-01-14' };
        dashboardsStore.appliedFilters = {
          date_range: {
            start: '2024-01-14',
            end: '2024-01-14',
          },
        };

        expect(wrapper.vm.showTagLive).toBe(false);
      });
    });
  });

  describe('Methods', () => {
    describe('navigateToDashboard', () => {
      it('should navigate to dashboard with correct parameters', () => {
        wrapper.vm.navigateToDashboard('new-dashboard-uuid');

        expect(mockRouter.replace).toHaveBeenCalledWith({
          name: 'dashboard',
          params: { dashboardUuid: 'new-dashboard-uuid' },
        });
      });
    });

    describe('goToDefaultDashboard', () => {
      it('should navigate to default dashboard', () => {
        wrapper.vm.goToDefaultDashboard();

        expect(mockRouter.replace).toHaveBeenCalledWith({
          name: 'dashboard',
          params: { dashboardUuid: 'dashboard-123' },
        });
      });
    });

    describe('routeUpdateCurrentDashboard', () => {
      it('should set current dashboard when dashboard exists in route', () => {
        wrapper.vm.routeUpdateCurrentDashboard();

        expect(dashboardsStore.setCurrentDashboard).toHaveBeenCalledWith(
          mockCurrentDashboard,
        );
      });

      it('should go to default dashboard when dashboard not found', () => {
        wrapper.vm.$route.params.dashboardUuid = 'non-existent-uuid';
        const navigateToSpy = vi.spyOn(wrapper.vm, 'navigateToDashboard');

        wrapper.vm.routeUpdateCurrentDashboard();

        expect(navigateToSpy).toHaveBeenCalledWith('dashboard-123');
        expect(dashboardsStore.setCurrentDashboard).toHaveBeenCalledWith(
          mockCurrentDashboard,
        );
      });
    });
  });

  describe('Watchers', () => {
    describe('currentDashboard watcher', () => {
      it('should navigate to new dashboard when currentDashboard changes', async () => {
        const newDashboard = {
          uuid: 'new-dashboard-uuid',
          name: 'New Dashboard',
        };
        const navigateToSpy = vi.spyOn(wrapper.vm, 'navigateToDashboard');

        dashboardsStore.currentDashboard = newDashboard;
        await nextTick();

        expect(navigateToSpy).toHaveBeenCalledWith('new-dashboard-uuid');
      });
    });

    describe('$route watcher', () => {
      it('should update current dashboard when route dashboardUuid changes', () => {
        const routeUpdateSpy = vi.spyOn(
          wrapper.vm,
          'routeUpdateCurrentDashboard',
        );

        wrapper.vm.$route.params.dashboardUuid = 'new-uuid';

        // Trigger the watcher manually
        wrapper.vm.$options.watch.$route.call(
          wrapper.vm,
          { params: { dashboardUuid: 'new-uuid' } },
          { params: { dashboardUuid: 'old-uuid' } },
        );

        expect(routeUpdateSpy).toHaveBeenCalled();
      });

      it('should not update when route dashboardUuid stays the same', () => {
        const routeUpdateSpy = vi.spyOn(
          wrapper.vm,
          'routeUpdateCurrentDashboard',
        );

        // Trigger the watcher manually with same uuid
        wrapper.vm.$options.watch.$route.call(
          wrapper.vm,
          { params: { dashboardUuid: 'same-uuid' } },
          { params: { dashboardUuid: 'same-uuid' } },
        );

        expect(routeUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('Lifecycle', () => {
    it('should call routeUpdateCurrentDashboard on mounted', () => {
      const routeUpdateSpy = vi.spyOn(
        Header.methods,
        'routeUpdateCurrentDashboard',
      );

      createWrapper();

      expect(routeUpdateSpy).toHaveBeenCalled();
    });
  });

  describe('Events', () => {
    it('should handle breadcrumb click', () => {
      const breadcrumb = wrapper.findComponent({ name: 'UnnnicBreadcrumb' });
      const eventData = { routeName: 'dashboard', routePath: '/dashboard/123' };

      breadcrumb.vm.$emit('crumb-click', eventData);

      expect(mockRouter.push).toHaveBeenCalledWith({
        name: 'dashboard',
        path: '/dashboard/123',
      });
    });

    it('should handle close expansive mode', async () => {
      widgetsStore.currentExpansiveWidget = { uuid: 'widget-123' };
      await nextTick();

      const closeButton = wrapper.find(
        '.insights-layout-header__expansive-close',
      );
      await closeButton.trigger('click');

      expect(widgetsStore.setCurrentExpansiveWidgetData).toHaveBeenCalledWith(
        {},
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle missing date filter', () => {
      dashboardsStore.currentDashboardFilters = [
        { name: 'sector', type: 'select' },
      ];
      wrapper = createWrapper();

      expect(wrapper.vm.showTagLive).toBe(true);
    });
  });
});
