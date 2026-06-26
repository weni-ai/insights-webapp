import { beforeEach, describe, expect, it, vi } from 'vitest';

import inAwaiting from '../inAwaiting';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/humanSupport/humanSupport');
vi.mock('@/utils/request');

describe('inAwaiting API', () => {
  const mockResponse = {
    next: null,
    previous: null,
    count: 1,
    results: [
      {
        awaiting_time: 90,
        contact: 'Jane',
        sector: 'Sales',
        queue: 'Priority',
        link: { url: 'https://example.com', type: 'room' },
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
      appliedDetailFilters: {
        contactInput: { value: '' },
      },
    });
    createRequestQuery.mockReturnValue({});
    http.get.mockResolvedValue(mockResponse);
  });

  it('calls the awaiting endpoint with formatted filters and default ordering', async () => {
    const result = await inAwaiting.getDetailedMonitoringInAwaiting();

    expect(http.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/awaiting/',
      {
        params: {
          project_uuid: 'test-project-uuid',
          sectors: ['sector1'],
          queues: ['queue1'],
          tags: ['tag1'],
          ordering: 'awaiting_time',
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('merges query params and custom ordering', async () => {
    createRequestQuery.mockReturnValue({ limit: 20 });

    await inAwaiting.getDetailedMonitoringInAwaiting({
      ordering: 'contact',
      limit: 20,
    });

    expect(http.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/awaiting/',
      {
        params: expect.objectContaining({
          ordering: 'contact',
          limit: 20,
        }),
      },
    );
  });

  it('includes contact filter from applied detail filters', async () => {
    useHumanSupport.mockReturnValue({
      appliedFilters: {
        sectors: [],
        queues: [],
        tags: [],
      },
      appliedDetailFilters: {
        contactInput: { value: '5511888888888' },
      },
    });

    await inAwaiting.getDetailedMonitoringInAwaiting();

    expect(http.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/awaiting/',
      {
        params: expect.objectContaining({
          contact: '5511888888888',
        }),
      },
    );
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(inAwaiting.getDetailedMonitoringInAwaiting()).rejects.toThrow(
      'Request failed',
    );
  });
});
