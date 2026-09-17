import { beforeEach, describe, expect, it, vi } from 'vitest';

import salesData from '../salesData';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/dashboards');
vi.mock('@/store/modules/humanSupport/humanSupport');
vi.mock('@/utils/request');

describe('salesData API', () => {
  const mockApiResponse = {
    average_order_value: 284,
    total_revenue: {
      value: 428450,
      last_period_value: 362480,
      variation: 18.2,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useConfig.mockReturnValue({ project: { uuid: 'test-project-uuid' } });
    useDashboards.mockReturnValue({
      currentDashboard: { uuid: 'test-dashboard-uuid' },
    });
    useHumanSupport.mockReturnValue({
      appliedFilters: {
        sectors: [{ value: 'sector1' }],
        queues: [{ value: 'queue1' }],
        tags: [{ value: 'tag1' }],
      },
      appliedDateRange: {
        start: '2026-01-01',
        end: '2026-01-31',
      },
    });
    createRequestQuery.mockReturnValue({});
    http.get.mockResolvedValue(mockApiResponse);
  });

  it('calls sales data endpoint with expected params', async () => {
    const result = await salesData.getSalesData();

    expect(http.get).toHaveBeenCalledWith(
      '/dashboards/test-dashboard-uuid/sales/sales_data/',
      {
        params: {
          project_uuid: 'test-project-uuid',
          start_date: '2026-01-01',
          end_date: '2026-01-31',
          sectors: ['sector1'],
          queues: ['queue1'],
          tags: ['tag1'],
        },
      },
    );
    expect(result).toEqual(mockApiResponse);
  });

  it('merges custom query params', async () => {
    createRequestQuery.mockReturnValue({ sectors: ['override'] });

    await salesData.getSalesData({ sectors: ['override'] });

    expect(http.get).toHaveBeenCalledWith(
      '/dashboards/test-dashboard-uuid/sales/sales_data/',
      {
        params: expect.objectContaining({
          sectors: ['override'],
        }),
      },
    );
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(salesData.getSalesData()).rejects.toThrow('Request failed');
  });
});
