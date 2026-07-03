import { beforeEach, describe, expect, it, vi } from 'vitest';

import finished from '../finished';
import http2 from '@/services/api/http2';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http2', () => ({
  default: {
    get: vi.fn(),
  },
}));
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/dashboards');
vi.mock('@/store/modules/humanSupport/humanSupport');
vi.mock('@/utils/request');

describe('finished analysis API', () => {
  const mockResponse = {
    next: null,
    previous: null,
    count: 1,
    results: [
      {
        agent: { name: 'Agent A', email: 'agent@example.com' },
        agent_email: 'agent@example.com',
        sector: { name: 'Support' },
        queue: { name: 'Default' },
        awaiting_time: 60,
        first_response_time: 30,
        response_time: 45,
        duration: 300,
        contact: 'John',
        ticket_id: 'TK-001',
        link: { url: 'https://example.com', type: 'room' },
      },
    ],
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
      appliedDetailFilters: {
        agent: { value: 'agent@example.com' },
        contact: { value: '5511999999999' },
        ticketId: { value: 'TK-001' },
      },
    });
    createRequestQuery.mockReturnValue({});
    http2.get.mockResolvedValue(mockResponse);
  });

  it('calls finished endpoint with filters, date range and detail filters', async () => {
    const result = await finished.getDetailedAnalysisFinishedData();

    expect(http2.get).toHaveBeenCalledWith(
      '/dashboards/test-dashboard-uuid/finished/',
      {
        params: {
          project_uuid: 'test-project-uuid',
          start_date: '2026-01-01',
          end_date: '2026-01-31',
          sectors: ['sector1'],
          queues: ['queue1'],
          tags: ['tag1'],
          agent: 'agent@example.com',
          contact: '5511999999999',
          ticket_id: 'TK-001',
          ordering: 'response_time',
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('uses custom ordering from query params', async () => {
    createRequestQuery.mockReturnValue({ limit: 25 });

    await finished.getDetailedAnalysisFinishedData({
      ordering: 'duration',
      limit: 25,
    });

    expect(http2.get).toHaveBeenCalledWith(
      '/dashboards/test-dashboard-uuid/finished/',
      {
        params: expect.objectContaining({
          ordering: 'duration',
          limit: 25,
        }),
      },
    );
  });

  it('throws when no dashboard is selected', async () => {
    useDashboards.mockReturnValue({ currentDashboard: null });

    await expect(finished.getDetailedAnalysisFinishedData()).rejects.toThrow(
      'No dashboard selected',
    );
  });

  it('propagates API errors', async () => {
    http2.get.mockRejectedValue(new Error('Request failed'));

    await expect(finished.getDetailedAnalysisFinishedData()).rejects.toThrow(
      'Request failed',
    );
  });
});
