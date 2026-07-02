import { beforeEach, describe, expect, it, vi } from 'vitest';

import attendant from '../attendant';
import http from '@/services/api/http';
import http2 from '@/services/api/http2';
import { useConfig } from '@/store/modules/config';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/services/api/http2', () => ({
  default: {
    get: vi.fn(),
  },
}));
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/humanSupport/humanSupport');
vi.mock('@/utils/request');

describe('attendant API', () => {
  const mockAttendantResponse = {
    next: null,
    previous: null,
    count: 1,
    results: [
      {
        agent: { name: 'Agent A', email: 'agent@example.com' },
        status: { status: 'online', label: 'Online' },
        ongoing: '2',
        finished: '10',
        average_first_response_time: 30,
        average_response_time: 45,
        average_duration: 300,
        time_in_service: 3600,
        link: { url: 'https://example.com', type: 'agent' },
      },
    ],
  };

  const mockAgentsCountResponse = {
    online: 5,
    custom_breaks: 2,
    offline: 3,
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
    });
    createRequestQuery.mockReturnValue({});
    http2.get.mockResolvedValue(mockAttendantResponse);
    http.get.mockResolvedValue(mockAgentsCountResponse);
  });

  describe('getDetailedMonitoringAttendant', () => {
    it('calls the agents endpoint with formatted filters and default ordering', async () => {
      const result = await attendant.getDetailedMonitoringAttendant();

      expect(http2.get).toHaveBeenCalledWith(
        '/metrics/human-support/detailed-monitoring/agents/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: ['sector1'],
            queues: ['queue1'],
            tags: ['tag1'],
            ordering: 'status',
          },
        },
      );
      expect(result).toEqual(mockAttendantResponse);
    });

    it('returns empty results when response results is missing', async () => {
      http2.get.mockResolvedValue({ count: 0 });

      const result = await attendant.getDetailedMonitoringAttendant();

      expect(result.results).toEqual([]);
    });

    it('merges custom query params', async () => {
      createRequestQuery.mockReturnValue({ agent: 'agent@example.com' });

      await attendant.getDetailedMonitoringAttendant({
        ordering: 'agent',
        agent: 'agent@example.com',
      });

      expect(http2.get).toHaveBeenCalledWith(
        '/metrics/human-support/detailed-monitoring/agents/',
        {
          params: expect.objectContaining({
            ordering: 'agent',
            agent: 'agent@example.com',
          }),
        },
      );
    });

    it('propagates API errors', async () => {
      http2.get.mockRejectedValue(new Error('Request failed'));

      await expect(attendant.getDetailedMonitoringAttendant()).rejects.toThrow(
        'Request failed',
      );
    });
  });

  describe('getAgentsCountByStatus', () => {
    it('calls the agents totals endpoint with formatted filters', async () => {
      const result = await attendant.getAgentsCountByStatus();

      expect(http.get).toHaveBeenCalledWith(
        '/metrics/human-support/detailed-monitoring/agents_totals/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: ['sector1'],
            queues: ['queue1'],
            tags: ['tag1'],
          },
        },
      );
      expect(result).toEqual(mockAgentsCountResponse);
    });

    it('propagates API errors', async () => {
      http.get.mockRejectedValue(new Error('Request failed'));

      await expect(attendant.getAgentsCountByStatus()).rejects.toThrow(
        'Request failed',
      );
    });
  });
});
