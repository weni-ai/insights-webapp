import { beforeEach, describe, expect, it, vi } from 'vitest';

import pauses from '../pauses';
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

describe('pauses API', () => {
  const mockResponse = {
    next: null,
    previous: null,
    count: 1,
    results: [
      {
        agent: { name: 'Agent A', email: 'agent@example.com' },
        opened: 1700000000,
        closed: 1700003600,
        status: { status: 'break', label: 'Break' },
        custom_status: [],
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
      activeTab: 'monitoring',
    });
    createRequestQuery.mockReturnValue({});
    http2.get.mockResolvedValue(mockResponse);
  });

  it('calls monitoring status endpoint without date range by default', async () => {
    const result = await pauses.getDetailedMonitoringPauses();

    expect(http2.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/status/',
      {
        params: {
          project_uuid: 'test-project-uuid',
          sectors: ['sector1'],
          queues: ['queue1'],
          tags: ['tag1'],
          ordering: 'agent',
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('includes date range and analysis path when active tab is analysis', async () => {
    useHumanSupport.mockReturnValue({
      appliedFilters: {
        sectors: [{ value: 'sector1' }],
        queues: [],
        tags: [],
      },
      appliedDateRange: {
        start: '2026-02-01',
        end: '2026-02-28',
      },
      activeTab: 'analysis',
    });

    await pauses.getDetailedMonitoringPauses();

    expect(http2.get).toHaveBeenCalledWith(
      '/metrics/human-support/analysis/detailed-monitoring/status/',
      {
        params: expect.objectContaining({
          start_date: '2026-02-01',
          end_date: '2026-02-28',
          ordering: 'agent',
        }),
      },
    );
  });

  it('merges custom query params and ordering', async () => {
    createRequestQuery.mockReturnValue({ agent: 'agent@example.com' });

    await pauses.getDetailedMonitoringPauses({
      ordering: 'opened',
      agent: 'agent@example.com',
    });

    expect(http2.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/status/',
      {
        params: expect.objectContaining({
          ordering: 'opened',
          agent: 'agent@example.com',
        }),
      },
    );
  });

  it('propagates API errors', async () => {
    http2.get.mockRejectedValue(new Error('Request failed'));

    await expect(pauses.getDetailedMonitoringPauses()).rejects.toThrow(
      'Request failed',
    );
  });
});
