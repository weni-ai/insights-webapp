import { beforeEach, describe, expect, it, vi } from 'vitest';

import volumePerChannel from '../volumePerChannel';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useHumanSupport } from '@/store/modules/humanSupport/humanSupport';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/dashboards');
vi.mock('@/store/modules/humanSupport/humanSupport');

describe('volumePerChannel API', () => {
  const apiResponse = {
    next: null,
    previous: null,
    count: 2,
    results: [
      { channel_name: 'WhatsApp', rooms_volume: 12 },
      { channel_name: 'Telegram', rooms_volume: 4 },
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
        channels: [{ value: 'channel1' }],
      },
      appliedDateRange: {
        start: '2026-01-01',
        end: '2026-01-31',
      },
    });
    http.get.mockResolvedValue({
      ...apiResponse,
      results: [...apiResponse.results],
    });
  });

  describe('getVolumePerChannelMonitoring', () => {
    it('calls monitoring channel metrics and maps rooms_volume to value', async () => {
      const result = await volumePerChannel.getVolumePerChannelMonitoring({
        limit: 10,
      });

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/test-dashboard-uuid/monitoring/channel_metrics/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: ['sector1'],
            queues: ['queue1'],
            tags: ['tag1'],
            channels: ['channel1'],
            limit: 10,
          },
        },
      );
      expect(result.results).toEqual([
        { channel_name: 'WhatsApp', value: 12 },
        { channel_name: 'Telegram', value: 4 },
      ]);
    });
  });

  describe('getVolumePerChannelAnalysis', () => {
    it('calls analysis channel metrics with date range and maps values', async () => {
      const result = await volumePerChannel.getVolumePerChannelAnalysis({
        chip_name: 'ongoing',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/dashboards/test-dashboard-uuid/analysis/channel_metrics/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: ['sector1'],
            queues: ['queue1'],
            tags: ['tag1'],
            channels: ['channel1'],
            start_date: '2026-01-01',
            end_date: '2026-01-31',
            chip_name: 'ongoing',
          },
        },
      );
      expect(result.results[0]).toEqual({
        channel_name: 'WhatsApp',
        value: 12,
      });
    });
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(
      volumePerChannel.getVolumePerChannelMonitoring({}),
    ).rejects.toThrow('Request failed');
  });
});
