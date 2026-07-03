import { beforeEach, describe, expect, it, vi } from 'vitest';

import serviceStatus from '../serviceStatus';
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

describe('serviceStatus analysis API', () => {
  const mockApiResponse = {
    finished: 150,
    average_conversation_duration: 600,
    average_first_response_time: 45,
    average_response_time: 90,
    average_waiting_time: 120,
  };

  const expectedFormattedResponse = {
    finished: 150,
    average_time_is_waiting: 120,
    average_time_first_response: 45,
    average_response_time: 90,
    average_time_chat: 600,
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

  it('calls finished rooms status endpoint and maps response fields', async () => {
    const result = await serviceStatus.getServiceStatusAnalysisData();

    expect(http.get).toHaveBeenCalledWith(
      '/dashboards/test-dashboard-uuid/analysis/finished_rooms_status/',
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
    expect(result).toEqual(expectedFormattedResponse);
  });

  it('merges custom query params', async () => {
    createRequestQuery.mockReturnValue({ sectors: ['override'] });

    await serviceStatus.getServiceStatusAnalysisData({ sectors: ['override'] });

    expect(http.get).toHaveBeenCalledWith(
      '/dashboards/test-dashboard-uuid/analysis/finished_rooms_status/',
      {
        params: expect.objectContaining({
          sectors: ['override'],
        }),
      },
    );
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(serviceStatus.getServiceStatusAnalysisData()).rejects.toThrow(
      'Request failed',
    );
  });
});
