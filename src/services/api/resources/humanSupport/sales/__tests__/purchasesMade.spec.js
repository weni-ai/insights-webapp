import { beforeEach, describe, expect, it, vi } from 'vitest';

import purchasesMade from '../purchasesMade';
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

describe('purchasesMade API', () => {
  const mockApiResponse = {
    leads_captured: {
      value: 45000,
      percentage: 100,
    },
    purchases_made: {
      value: 4250,
      percentage: 9.44,
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

  it('calls purchases made endpoint with expected params', async () => {
    const result = await purchasesMade.getPurchasesMadeData();

    expect(http.get).toHaveBeenCalledWith(
      '/dashboards/test-dashboard-uuid/sales/purchases_made/',
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

    await purchasesMade.getPurchasesMadeData({ sectors: ['override'] });

    expect(http.get).toHaveBeenCalledWith(
      '/dashboards/test-dashboard-uuid/sales/purchases_made/',
      {
        params: expect.objectContaining({
          sectors: ['override'],
        }),
      },
    );
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(purchasesMade.getPurchasesMadeData()).rejects.toThrow(
      'Request failed',
    );
  });
});
