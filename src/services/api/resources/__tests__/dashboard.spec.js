import { describe, it, expect, vi, beforeEach } from 'vitest';
import http from '@/services/api/http';
import DashboardService from '../dashboards';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/utils/filter', () => ({
  isFilteringDates: vi.fn(() => false),
}));

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  default: {
    state: {
      project: { uuid: 'mock-project-uuid' },
    },
  },
}));

vi.mock('@/store/modules/dashboards', () => ({
  default: {
    state: {
      appliedFilters: { status: 'open', priority: 'high' },
      currentDashboardFilters: [{ name: 'status', type: 'select' }],
    },
  },
}));

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe('getAll', () => {
    it('should fetch and map dashboards correctly', async () => {
      http.get.mockResolvedValueOnce({
        results: [
          {
            uuid: 'uuid1',
            name: 'Dashboard 1',
            grid: [12, 6],
            is_default: true,
            is_editable: true,
            is_deletable: false,
            config: {},
          },
        ],
      });

      const { dashboards } = await DashboardService.getAll();

      expect(http.get).toHaveBeenCalledWith('/dashboards/', {
        params: { project: 'mock-project-uuid' },
      });
      expect(dashboards).toHaveLength(1);
      expect(dashboards[0]).toMatchObject({
        uuid: 'uuid1',
        name: 'Dashboard 1',
        grid: { columns: 12, rows: 6 },
      });
    });
  });

  describe('getDashboardFilters', () => {
    it('should throw an error if no UUID is provided', async () => {
      await expect(DashboardService.getDashboardFilters()).rejects.toThrow(
        'Please provide a valid UUID to request dashboard filters.',
      );
    });

    it('should fetch and map filters correctly', async () => {
      http.get.mockResolvedValueOnce({
        filter1: {
          label: 'Filter 1',
          placeholder: 'Placeholder 1',
          type: 'type1',
          source: 'source1',
          depends_on: null,
          start_sufix: 'start',
          end_sufix: 'end',
          field: 'field1',
        },
      });

      const filters = await DashboardService.getDashboardFilters('mock-uuid');

      expect(http.get).toHaveBeenCalledWith('/dashboards/mock-uuid/filters/', {
        params: { project: 'mock-project-uuid' },
      });
      expect(filters).toHaveLength(1);
      expect(filters[0]).toMatchObject({
        name: 'filter1',
        label: 'Filter 1',
      });
    });
  });

  describe('getDashboardWidgets', () => {
    it('should throw an error if no UUID is provided', async () => {
      await expect(DashboardService.getDashboardWidgets()).rejects.toThrow(
        'Please provide a valid UUID parameter to request widgets from this dashboard.',
      );
    });

    it('should fetch and map widgets correctly', async () => {
      http.get.mockResolvedValueOnce({
        results: [
          {
            uuid: 'widget-uuid',
            name: 'Widget 1',
            type: 'chart',
            config: {},
            position: {
              columns: [0, 4],
              rows: [0, 2],
            },
            report: {},
            source: 'source1',
            is_configurable: true,
          },
        ],
      });

      const widgets = await DashboardService.getDashboardWidgets('mock-uuid');

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/mock-uuid/list_widgets/',
        {
          params: { project: 'mock-project-uuid' },
        },
      );
      expect(widgets).toHaveLength(1);
      expect(widgets[0]).toMatchObject({
        uuid: 'widget-uuid',
        name: 'Widget 1',
        grid_position: {
          column_start: 0,
          column_end: 4,
          row_start: 0,
          row_end: 2,
        },
      });
    });
  });

  describe('getDashboardWidgetData', () => {
    it('should throw an error if no dashboardUuid or widgetUuid is provided', async () => {
      await expect(
        DashboardService.getDashboardWidgetData({
          dashboardUuid: null,
          widgetUuid: null,
        }),
      ).rejects.toThrow(
        'Please provide valids UUIDs parameters to request data of widget.',
      );
    });

    it('should fetch widget data with proper query parameters', async () => {
      http.get.mockResolvedValueOnce({ data: 'mock-widget-data' });

      const response = await DashboardService.getDashboardWidgetData({
        dashboardUuid: 'mock-dashboard-uuid',
        widgetUuid: 'mock-widget-uuid',
        params: { limit: 10 },
      });

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/mock-dashboard-uuid/widgets/mock-widget-uuid/data/',
        {
          params: {
            project: 'mock-project-uuid',
            is_live: true,
            status: 'open',
            priority: 'high',
            limit: 10,
          },
        },
      );

      expect(response).toEqual({ data: 'mock-widget-data' });
    });

    it('should set is_live to undefined if filtering dates', async () => {
      http.get.mockResolvedValueOnce({ data: 'mock-widget-data' });

      const response = await DashboardService.getDashboardWidgetData({
        dashboardUuid: 'mock-dashboard-uuid',
        widgetUuid: 'mock-widget-uuid',
        params: { limit: 10 },
      });

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/mock-dashboard-uuid/widgets/mock-widget-uuid/data/',
        {
          params: {
            project: 'mock-project-uuid',
            is_live: true,
            status: 'open',
            priority: 'high',
            limit: 10,
          },
        },
      );

      expect(response).toEqual({ data: 'mock-widget-data' });
    });
  });

  describe('getDashboardWidgetReport', () => {
    it('should throw an error if dashboardUuid or widgetUuid is not provided', async () => {
      await expect(
        DashboardService.getDashboardWidgetReport({
          dashboardUuid: null,
          widgetUuid: null,
        }),
      ).rejects.toThrow(
        'Please provide valids UUIDs parameters to request report of widget.',
      );

      await expect(
        DashboardService.getDashboardWidgetReport({
          dashboardUuid: 'mock-dashboard-uuid',
          widgetUuid: null,
        }),
      ).rejects.toThrow(
        'Please provide valids UUIDs parameters to request report of widget.',
      );
    });

    it('should call http.get with the correct URL and query parameters', async () => {
      const mockResponse = { data: 'mock-widget-report-data' };
      http.get.mockResolvedValueOnce(mockResponse);

      const response = await DashboardService.getDashboardWidgetReport({
        dashboardUuid: 'mock-dashboard-uuid',
        widgetUuid: 'mock-widget-uuid',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/mock-dashboard-uuid/widgets/mock-widget-uuid/report/',
        { params: { project: 'mock-project-uuid' } },
      );

      expect(response).toEqual(mockResponse);
    });

    it('should propagate errors from the API', async () => {
      const mockError = new Error('API Error');
      http.get.mockRejectedValueOnce(mockError);

      await expect(
        DashboardService.getDashboardWidgetReport({
          dashboardUuid: 'mock-dashboard-uuid',
          widgetUuid: 'mock-widget-uuid',
        }),
      ).rejects.toThrow('API Error');
    });
  });

  describe('getDashboardWidgetReportData', () => {
    it('should throw an error if dashboardUuid or widgetUuid is not provided', async () => {
      await expect(
        DashboardService.getDashboardWidgetReportData({
          dashboardUuid: null,
          widgetUuid: null,
        }),
      ).rejects.toThrow(
        'Please provide valids UUIDs parameters to request report data of widget.',
      );
    });

    it('should call http.get with the correct URL and query parameters', () => {
      const mockResponse = { data: 'mock-widget-report-data' };
      http.get.mockResolvedValueOnce(mockResponse);

      DashboardService.getDashboardWidgetReportData({
        dashboardUuid: 'dashboard-uuid',
        widgetUuid: 'widget-uuid',
        slug: 'slug',
        offset: 0,
        limit: 5,
        next: null,
      });

      const params = createRequestQuery(
        { status: 'open', priority: 'high' },
        {
          project: 'mock-project-uuid',
          is_live: true,
          slug: 'slug',
          offset: 0,
          limit: 5,
          next: null,
        },
      );

      expect(http.get).toHaveBeenCalled();
      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/dashboard-uuid/widgets/widget-uuid/report/data/',
        { params },
      );
    });
  });

  describe('setDefaultDashboard', () => {
    it('should call http.patch with the correct URL, body, and query parameters', async () => {
      const mockResponse = { success: true };
      http.patch.mockResolvedValueOnce(mockResponse);

      const dashboardUuid = 'mock-dashboard-uuid';
      const isDefault = true;

      const response = await DashboardService.setDefaultDashboard({
        dashboardUuid,
        isDefault,
      });

      expect(http.patch).toHaveBeenCalledWith(
        `/dashboards/${dashboardUuid}/is_default/`,
        { is_default: isDefault },
        {
          params: { project: 'mock-project-uuid' },
        },
      );
      expect(response).toEqual(mockResponse);
    });

    it('should propagate errors from the API', async () => {
      const mockError = new Error('API Error');
      http.patch.mockRejectedValueOnce(mockError);

      const dashboardUuid = 'mock-dashboard-uuid';
      const isDefault = false;

      await expect(
        DashboardService.setDefaultDashboard({ dashboardUuid, isDefault }),
      ).rejects.toThrow('API Error');
    });
  });

  describe('createFlowsDashboard', () => {
    it('should call http.post with the correct URL, body, and query parameters', async () => {
      const mockResponse = { success: true };
      http.post.mockResolvedValueOnce(mockResponse);

      const dashboardName = 'New Dashboard';
      const funnelAmount = 100;
      const currencyType = 'USD';

      const response = await DashboardService.createFlowsDashboard({
        dashboardName,
        funnelAmount,
        currencyType,
      });

      expect(http.post).toHaveBeenCalledWith(
        '/dashboards/create_flows_dashboard/',
        {
          name: dashboardName,
          funnel_amount: funnelAmount,
          currency_type: currencyType,
        },
        {
          params: { project: 'mock-project-uuid' },
        },
      );
      expect(response).toEqual(mockResponse);
    });

    it('should propagate errors from the API', async () => {
      const mockError = new Error('API Error');
      http.post.mockRejectedValueOnce(mockError);

      const dashboardName = 'New Dashboard';
      const funnelAmount = 100;
      const currencyType = 'USD';

      await expect(
        DashboardService.createFlowsDashboard({
          dashboardName,
          funnelAmount,
          currencyType,
        }),
      ).rejects.toThrow('API Error');
    });
  });

  describe('updateFlowsDashboard', () => {
    it('should call http.patch with the correct URL, body, and query parameters', async () => {
      const mockResponse = { success: true };
      http.patch.mockResolvedValueOnce(mockResponse);

      const dashboardUuid = 'mock-dashboard-uuid';
      const dashboardName = 'Updated Dashboard';
      const currencyType = 'USD';

      const response = await DashboardService.updateFlowsDashboard({
        dashboardUuid,
        dashboardName,
        currencyType,
      });

      expect(http.patch).toHaveBeenCalledWith(
        `/dashboards/${dashboardUuid}/`,
        {
          name: dashboardName,
          config: { currency_type: currencyType },
        },
        {
          params: { project: 'mock-project-uuid' },
        },
      );
      expect(response).toEqual(mockResponse);
    });

    it('should propagate errors from the API', async () => {
      const mockError = new Error('API Error');
      http.patch.mockRejectedValueOnce(mockError);

      const dashboardUuid = 'mock-dashboard-uuid';
      const dashboardName = 'Updated Dashboard';
      const currencyType = 'USD';

      await expect(
        DashboardService.updateFlowsDashboard({
          dashboardUuid,
          dashboardName,
          currencyType,
        }),
      ).rejects.toThrow('API Error');
    });
  });

  describe('deleteDashboard', () => {
    it('should call http.delete with the correct URL and query parameters', async () => {
      const mockResponse = { success: true };
      http.delete.mockResolvedValueOnce(mockResponse);

      const response = await DashboardService.deleteDashboard(
        'mock-dashboard-uuid',
      );

      expect(http.delete).toHaveBeenCalledWith(
        '/dashboards/mock-dashboard-uuid/',
        {
          params: { project: 'mock-project-uuid' },
        },
      );
      expect(response).toEqual(mockResponse);
    });

    it('should propagate errors from the API', async () => {
      const mockError = new Error('API Error');
      http.delete.mockRejectedValueOnce(mockError);

      await expect(
        DashboardService.deleteDashboard('mock-dashboard-uuid'),
      ).rejects.toThrow('API Error');
    });
  });
});
