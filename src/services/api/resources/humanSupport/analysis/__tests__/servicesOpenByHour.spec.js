import { beforeEach, describe, expect, it, vi } from 'vitest';

import servicesOpenByHour from '../servicesOpenByHour';
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

describe('servicesOpenByHour analysis API', () => {
  const mockResults = [
    { label: '08:00', value: 45 },
    { label: '14:00', value: 78 },
  ];

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
    http.get.mockResolvedValue({ results: mockResults });
  });

  it('calls analysis peaks endpoint with filters and date range', async () => {
    const result = await servicesOpenByHour.getServicesOpenByHourAnalysisData();

    expect(http.get).toHaveBeenCalledWith(
      'dashboards/test-dashboard-uuid/analysis/peaks_in_human_service/',
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
    expect(result).toEqual(mockResults);
  });

  it('merges custom query params', async () => {
    createRequestQuery.mockReturnValue({ sectors: ['override'] });

    await servicesOpenByHour.getServicesOpenByHourAnalysisData({
      sectors: ['override'],
    });

    expect(http.get).toHaveBeenCalledWith(
      'dashboards/test-dashboard-uuid/analysis/peaks_in_human_service/',
      {
        params: expect.objectContaining({
          sectors: ['override'],
        }),
      },
    );
  });

  it('returns empty array when results is empty', async () => {
    http.get.mockResolvedValue({ results: [] });

    const result = await servicesOpenByHour.getServicesOpenByHourAnalysisData();

    expect(result).toEqual([]);
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(
      servicesOpenByHour.getServicesOpenByHourAnalysisData(),
    ).rejects.toThrow('Request failed');
  });
});
