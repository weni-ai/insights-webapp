import { beforeEach, describe, expect, it, vi } from 'vitest';

import volumePerTag from '../volumePerTag';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/dashboards');
vi.mock('@/store/modules/humanSupport/humanSupport');

describe('volumePerTag API', () => {
  const mockResponse = {
    next: null,
    previous: null,
    count: 1,
    results: [
      {
        sector_name: 'Support',
        total_tags: 2,
        tags: [
          { tag_name: 'Urgent', value: 8 },
          { tag_name: 'VIP', value: 3 },
        ],
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
    });
    http.get.mockResolvedValue(mockResponse);
  });

  describe('getVolumePerTagsMonitoring', () => {
    it('calls monitoring tags volume endpoint with formatted filters', async () => {
      const result = await volumePerTag.getVolumePerTagsMonitoring({
        limit: 10,
      });

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/test-dashboard-uuid/monitoring/tags_volume/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: ['sector1'],
            queues: ['queue1'],
            tags: ['tag1'],
            limit: 10,
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getVolumePerTagsAnalysis', () => {
    it('calls analysis tags volume endpoint with date range', async () => {
      const result = await volumePerTag.getVolumePerTagsAnalysis({
        chip_name: 'urgent',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/test-dashboard-uuid/analysis/tags_volume/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: ['sector1'],
            queues: ['queue1'],
            tags: ['tag1'],
            start_date: '2026-01-01',
            end_date: '2026-01-31',
            chip_name: 'urgent',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(volumePerTag.getVolumePerTagsMonitoring({})).rejects.toThrow(
      'Request failed',
    );
  });
});
