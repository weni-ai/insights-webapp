import { beforeEach, describe, expect, it, vi } from 'vitest';

import inProgress from '../inProgress';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/humanSupport/humanSupport');
vi.mock('@/utils/request');

describe('inProgress API', () => {
  const mockResponse = {
    next: null,
    previous: null,
    count: 1,
    results: [
      {
        agent: 'Agent A',
        duration: 120,
        first_response_time: 30,
        pending_response: false,
        awaiting_time: 15,
        sector: 'Support',
        queue: 'Default',
        contact: 'John',
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

  it('calls the on-going endpoint with formatted filters and default ordering', async () => {
    const result = await inProgress.getDetailedMonitoringInProgress();

    expect(http.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/on-going/',
      {
        params: {
          project_uuid: 'test-project-uuid',
          sectors: ['sector1'],
          queues: ['queue1'],
          tags: ['tag1'],
          ordering: 'duration',
        },
      },
    );
    expect(result).toEqual(mockResponse);
  });

  it('merges query params and custom ordering', async () => {
    createRequestQuery.mockReturnValue({ limit: 10, offset: 0 });

    await inProgress.getDetailedMonitoringInProgress({
      ordering: 'first_response_time',
      limit: 10,
    });

    expect(http.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/on-going/',
      {
        params: expect.objectContaining({
          ordering: 'first_response_time',
          limit: 10,
          offset: 0,
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
        contactInput: { value: '5511999999999' },
      },
    });

    await inProgress.getDetailedMonitoringInProgress();

    expect(http.get).toHaveBeenCalledWith(
      '/metrics/human-support/detailed-monitoring/on-going/',
      {
        params: expect.objectContaining({
          contact: '5511999999999',
        }),
      },
    );
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(inProgress.getDetailedMonitoringInProgress()).rejects.toThrow(
      'Request failed',
    );
  });
});
