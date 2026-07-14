import { beforeEach, describe, expect, it, vi } from 'vitest';

import csat from '../csat';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/dashboards');
vi.mock('@/store/modules/humanSupport/humanSupport');

describe('csat API', () => {
  const mockTotalsResponse = {
    next: null,
    previous: null,
    general: { rooms: 100, reviews: 80, avg_rating: 4.5 },
    results: [
      {
        agent: { name: 'Agent A', email: 'agent@example.com' },
        rooms: 20,
        reviews: 15,
        avg_rating: 4.8,
      },
    ],
  };

  const mockRatingsResponse = {
    5: { value: 50, full_value: 62.5 },
    4: { value: 20, full_value: 25 },
    3: { value: 5, full_value: 6.25 },
    2: { value: 3, full_value: 3.75 },
    1: { value: 2, full_value: 2.5 },
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
    http.get.mockResolvedValue(mockTotalsResponse);
  });

  describe('getTotalsMonitoring', () => {
    it('calls monitoring csat totals endpoint with formatted filters', async () => {
      const result = await csat.getTotalsMonitoring({ agent_email: 'a@b.com' });

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/test-dashboard-uuid/monitoring/csat/totals/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: ['sector1'],
            queues: ['queue1'],
            tags: ['tag1'],
            agent_email: 'a@b.com',
          },
        },
      );
      expect(result).toEqual(mockTotalsResponse);
    });
  });

  describe('getTotalsAnalysis', () => {
    it('calls analysis csat totals endpoint with date range', async () => {
      const result = await csat.getTotalsAnalysis({ cursor: 'page-2' });

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/test-dashboard-uuid/analysis/csat/totals/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            start_date: '2026-01-01',
            end_date: '2026-01-31',
            sectors: ['sector1'],
            queues: ['queue1'],
            tags: ['tag1'],
            cursor: 'page-2',
          },
        },
      );
      expect(result).toEqual(mockTotalsResponse);
    });
  });

  describe('getRatingsMonitoring', () => {
    it('calls monitoring csat ratings endpoint with formatted filters', async () => {
      http.get.mockResolvedValue(mockRatingsResponse);

      const result = await csat.getRatingsMonitoring({});

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/test-dashboard-uuid/monitoring/csat/ratings/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: ['sector1'],
            queues: ['queue1'],
            tags: ['tag1'],
          },
        },
      );
      expect(result).toEqual(mockRatingsResponse);
    });
  });

  describe('getRatingsAnalysis', () => {
    it('calls analysis csat ratings endpoint with date range', async () => {
      http.get.mockResolvedValue(mockRatingsResponse);

      const result = await csat.getRatingsAnalysis({});

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/test-dashboard-uuid/analysis/csat/ratings/',
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
      expect(result).toEqual(mockRatingsResponse);
    });
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(csat.getTotalsMonitoring()).rejects.toThrow('Request failed');
  });
});
