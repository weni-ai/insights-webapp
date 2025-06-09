import { beforeEach, describe, it, vi, expect, afterEach } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import { createTestingPinia } from '@pinia/testing';
import { setActivePinia } from 'pinia';

import { useWidgetNavigation } from '../useWidgetNavigation';
import { useDashboards } from '@/store/modules/dashboards';

// Mock vue-router
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  currentRoute: {
    value: {
      query: { test: 'query' },
    },
  },
};

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

// Mock global window object
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

describe('useWidgetNavigation', () => {
  let pinia;
  let dashboardsStore;

  beforeEach(() => {
    vi.clearAllMocks();
    pinia = createTestingPinia({
      initialState: {
        dashboards: {
          currentDashboard: {
            uuid: 'dashboard-123',
            name: 'Test Dashboard',
          },
        },
      },
    });
    setActivePinia(pinia);
    dashboardsStore = useDashboards();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('redirectToReport', () => {
    it('should redirect to internal report correctly', () => {
      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        uuid: 'widget-123',
        report: { type: 'internal' },
      };

      redirectToReport(widget);

      expect(mockPush).toHaveBeenCalledWith({
        name: 'report',
        params: {
          dashboardUuid: 'dashboard-123',
          widgetUuid: 'widget-123',
        },
        query: {
          test: 'query',
        },
      });
    });

    it('should open external report in new window', () => {
      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        uuid: 'widget-456',
        report: {
          type: 'external',
          url: 'https://external-report.com',
        },
      };

      redirectToReport(widget);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://external-report.com',
        '_blank',
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should do nothing when no report is configured', () => {
      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        uuid: 'widget-789',
        // No report property
      };

      redirectToReport(widget);

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should do nothing when report is null', () => {
      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        uuid: 'widget-null',
        report: null,
      };

      redirectToReport(widget);

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should handle unknown report type gracefully', () => {
      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        uuid: 'widget-unknown',
        report: { type: 'unknown-type' },
      };

      redirectToReport(widget);

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should handle missing widget uuid', () => {
      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        // No uuid property
        report: { type: 'internal' },
      };

      redirectToReport(widget);

      expect(mockPush).toHaveBeenCalledWith({
        name: 'report',
        params: {
          dashboardUuid: 'dashboard-123',
          widgetUuid: undefined,
        },
        query: {
          test: 'query',
        },
      });
    });

    it('should use current dashboard uuid from store', () => {
      // Update the dashboard uuid in store
      dashboardsStore.currentDashboard = {
        uuid: 'updated-dashboard-456',
        name: 'Updated Dashboard',
      };

      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        uuid: 'widget-store-test',
        report: { type: 'internal' },
      };

      redirectToReport(widget);

      expect(mockPush).toHaveBeenCalledWith({
        name: 'report',
        params: {
          dashboardUuid: 'updated-dashboard-456',
          widgetUuid: 'widget-store-test',
        },
        query: {
          test: 'query',
        },
      });
    });

    it('should preserve current route query parameters', () => {
      // Update the current route query
      mockRouter.currentRoute.value.query = {
        filter: 'active',
        page: '2',
        sort: 'name',
      };

      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        uuid: 'widget-query-test',
        report: { type: 'internal' },
      };

      redirectToReport(widget);

      expect(mockPush).toHaveBeenCalledWith({
        name: 'report',
        params: {
          dashboardUuid: 'dashboard-123',
          widgetUuid: 'widget-query-test',
        },
        query: {
          filter: 'active',
          page: '2',
          sort: 'name',
        },
      });
    });

    it('should handle external report with missing url', () => {
      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        uuid: 'widget-no-url',
        report: {
          type: 'external',
          // No url property
        },
      };

      redirectToReport(widget);

      expect(mockWindowOpen).toHaveBeenCalledWith(undefined, '_blank');
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should be reactive to store changes', () => {
      const { redirectToReport } = useWidgetNavigation();

      // Initial call
      const widget1 = {
        uuid: 'widget-reactive-1',
        report: { type: 'internal' },
      };

      redirectToReport(widget1);

      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            dashboardUuid: 'dashboard-123',
          }),
        }),
      );

      // Change dashboard in store
      dashboardsStore.currentDashboard = {
        uuid: 'new-dashboard-uuid',
        name: 'New Dashboard',
      };

      // Second call should use new dashboard uuid
      const widget2 = {
        uuid: 'widget-reactive-2',
        report: { type: 'internal' },
      };

      redirectToReport(widget2);

      expect(mockPush).toHaveBeenLastCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            dashboardUuid: 'new-dashboard-uuid',
          }),
        }),
      );
    });
  });

  describe('Composable Structure', () => {
    it('should return expected functions', () => {
      const composable = useWidgetNavigation();

      expect(composable).toHaveProperty('redirectToReport');
      expect(typeof composable.redirectToReport).toBe('function');
    });

    it('should be callable multiple times without issues', () => {
      const composable1 = useWidgetNavigation();
      const composable2 = useWidgetNavigation();

      expect(composable1.redirectToReport).toBeDefined();
      expect(composable2.redirectToReport).toBeDefined();

      // Both should work independently
      const widget = {
        uuid: 'test-widget',
        report: { type: 'internal' },
      };

      composable1.redirectToReport(widget);
      composable2.redirectToReport(widget);

      expect(mockPush).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined widget gracefully', () => {
      const { redirectToReport } = useWidgetNavigation();

      expect(() => {
        redirectToReport(undefined);
      }).not.toThrow();

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should handle empty widget object', () => {
      const { redirectToReport } = useWidgetNavigation();

      const widget = {};

      redirectToReport(widget);

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should handle widget with empty report object', () => {
      const { redirectToReport } = useWidgetNavigation();

      const widget = {
        uuid: 'test-widget',
        report: {},
      };

      redirectToReport(widget);

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });
  });
});
