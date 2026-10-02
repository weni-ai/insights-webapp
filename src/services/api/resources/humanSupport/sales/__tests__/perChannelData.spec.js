import { beforeEach, describe, expect, it, vi } from 'vitest';

import perChannelData from '../perChannelData';
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

describe('perChannelData API', () => {
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
  });

  it('returns mapped revenue mock with default pagination', async () => {
    const result = await perChannelData.getPerChannelData();

    expect(http.get).not.toHaveBeenCalled();
    expect(result.count).toBe(7);
    expect(result.results).toHaveLength(5);
    expect(result.next).toBe('next');
    expect(result.previous).toBeNull();
    expect(result.results[0]).toEqual({
      channel_name: 'whatsapp',
      value: 124500,
      percentage: 29.06,
    });
    expect(result.results.map((item) => item.channel_name)).toEqual([
      'whatsapp',
      'shopping_assistant',
      'email',
      'instagram',
      'facebook',
    ]);
  });

  it('uses chip_name as type for sale mock data', async () => {
    const result = await perChannelData.getPerChannelData({
      chip_name: 'sale',
    });

    expect(result.results[0]).toEqual({
      channel_name: 'whatsapp',
      value: 1245,
      percentage: 29.06,
    });
  });

  it('slices mock results by limit and offset', async () => {
    const result = await perChannelData.getPerChannelData({
      type: 'revenue',
      limit: 2,
      offset: 5,
    });

    expect(result.count).toBe(7);
    expect(result.previous).toBe('previous');
    expect(result.next).toBeNull();
    expect(result.results).toEqual([
      { channel_name: 'teams', value: 32100, percentage: 7.5 },
      { channel_name: 'others', value: 25050, percentage: 5.85 },
    ]);
  });
});
