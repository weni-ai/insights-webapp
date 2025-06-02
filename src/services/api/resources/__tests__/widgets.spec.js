import { describe, it, expect, vi, beforeEach } from 'vitest';

import WidgetService from '../widgets';
import http from '@/services/api/http';
import { WidgetOutgoing } from '@/models';

vi.mock('@/services/api/http', () => ({
  default: { patch: vi.fn(), get: vi.fn() },
}));

vi.mock('@/models', () => ({
  WidgetOutgoing: vi.fn(),
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(() => ({
    project: { uuid: 'mock-project-uuid' },
  })),
}));

vi.mock('@/store/modules/dashboards', () => ({
  useDashboards: vi.fn(() => ({
    appliedFilters: { mockFilter: 'value' },
  })),
}));

vi.mock('@/store/modules/user', () => ({
  useUser: vi.fn(() => ({
    email: 'mock@email.com',
  })),
}));

vi.mock('@/utils/request', () => ({
  createRequestQuery: vi.fn((filters, params) => params),
}));

describe('updateWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if no widget is provided', async () => {
    await expect(WidgetService.updateWidget({})).rejects.toThrow(
      'Please provide a valid uuid to request update widget.',
    );
  });

  it('should call the API with the correct URL and data', async () => {
    const widget = { uuid: 'mock-uuid', name: 'Widget 1' };
    const mockResponse = { success: true };
    http.patch.mockResolvedValueOnce(mockResponse);

    const expectedWidgetOutgoing = new WidgetOutgoing(widget);

    const response = await WidgetService.updateWidget({ widget });

    expect(WidgetOutgoing).toHaveBeenCalledWith(widget);
    expect(http.patch).toHaveBeenCalledWith(
      '/widgets/mock-uuid/',
      expectedWidgetOutgoing,
    );
    expect(response).toEqual(mockResponse);
  });

  it('should handle API errors correctly', async () => {
    const widget = { uuid: 'mock-uuid', name: 'Widget 1' };
    const mockError = new Error('API Error');
    http.patch.mockRejectedValueOnce(mockError);

    await expect(WidgetService.updateWidget({ widget })).rejects.toThrow(
      'API Error',
    );
  });
});

describe('getFlowContactResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call the API with the correct parameters', async () => {
    const params = {
      flow: 'mock-flow-uuid',
      result: 'mock-result',
      label: 'mock-label',
      limit: 10,
      page: 1,
    };

    const mockResponse = { data: 'mock-data' };
    http.get.mockResolvedValueOnce(mockResponse);

    const response = await WidgetService.getFlowContactResults(params);

    expect(http.get).toHaveBeenCalledWith('/dashboards/get_contacts_results/', {
      params: {
        page_number: 1,
        page_size: 10,
        project_uuid: 'mock-project-uuid',
        op_field: 'mock-result',
        label: 'mock-label',
        flow_uuid: 'mock-flow-uuid',
        user_email: 'mock@email.com',
      },
    });
    expect(response).toEqual(mockResponse);
  });

  it('should handle API errors correctly', async () => {
    const params = {
      flow: 'mock-flow-uuid',
      result: 'mock-result',
      label: 'mock-label',
      limit: 10,
      page: 1,
    };

    const mockError = new Error('API Error');
    http.get.mockRejectedValueOnce(mockError);

    await expect(WidgetService.getFlowContactResults(params)).rejects.toThrow(
      'API Error',
    );
  });
});
