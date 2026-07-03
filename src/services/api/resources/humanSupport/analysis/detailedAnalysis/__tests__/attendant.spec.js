import { beforeEach, describe, expect, it, vi } from 'vitest';

import attendant from '../attendant';
import http2 from '@/services/api/http2';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http2', () => ({
  default: {
    get: vi.fn(),
  },
}));
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/humanSupport/humanSupport');
vi.mock('@/utils/request');

describe('attendant analysis API', () => {
  const mockResponse = {
    next: null,
    previous: null,
    count: 1,
    results: [
      {
        agent: { name: 'Agent A', email: 'agent@example.com' },
        finished: '15',
        average_first_response_time: 30,
        average_response_time: 45,
        average_duration: 300,
        time_in_service: 3600,
        link: { url: 'https://example.com', type: 'agent' },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useConfig.mockReturnValue({ project: { uuid: 'test-project-uuid' } });
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
    http2.get.mockResolvedValue(mockResponse);
  });

  it('calls agents endpoint with filters and date range', async () => {
    const result = await attendant.getDetailedAnalysisAttendantData();

    expect(http2.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/agents/',
      {
        params: {
          project_uuid: 'test-project-uuid',
          start_date: '2026-01-01',
          end_date: '2026-01-31',
          sectors: ['sector1'],
          queues: ['queue1'],
          tags: ['tag1'],
          ordering: 'status',
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('returns empty results when response results is missing', async () => {
    http2.get.mockResolvedValue({ count: 0 });

    const result = await attendant.getDetailedAnalysisAttendantData();

    expect(result.results).toEqual([]);
  });

  it('merges custom query params and ordering', async () => {
    createRequestQuery.mockReturnValue({ agent: 'agent@example.com' });

    await attendant.getDetailedAnalysisAttendantData({
      ordering: 'finished',
      agent: 'agent@example.com',
    });

    expect(http2.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/agents/',
      {
        params: expect.objectContaining({
          ordering: 'finished',
          agent: 'agent@example.com',
        }),
      },
    );
  });

  it('propagates API errors', async () => {
    http2.get.mockRejectedValue(new Error('Request failed'));

    await expect(attendant.getDetailedAnalysisAttendantData()).rejects.toThrow(
      'Request failed',
    );
  });
});
