import { beforeEach, describe, expect, it, vi } from 'vitest';

import perRepresentative from '../perRepresentative';
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

describe('perRepresentative API', () => {
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

  it('returns paginated mock data ordered by revenue desc by default', async () => {
    const result = await perRepresentative.getPerRepresentative();

    expect(http.get).not.toHaveBeenCalled();
    expect(result.count).toBe(24);
    expect(result.results).toHaveLength(12);
    expect(result.next).toBe('next');
    expect(result.previous).toBeNull();
    expect(result.results[0]).toEqual({
      representative: { name: 'Emma Wilson', email: 'emma.wilson@example.com' },
      conversations: 612,
      sales: 254,
      conversions: 41.5,
      revenue: 72340,
      average_order_value: 285,
      trend: { value: 12.4, variation_type: 'INCREASE' },
    });
  });

  it('slices mock results by limit and offset', async () => {
    const result = await perRepresentative.getPerRepresentative({
      limit: 2,
      offset: 22,
    });

    expect(result.count).toBe(24);
    expect(result.previous).toBe('previous');
    expect(result.next).toBeNull();
    expect(result.results).toHaveLength(2);
    expect(result.results[0].representative.name).toBe('Patrícia Gomes');
    expect(result.results[1].representative.name).toBe('Renato Cunha');
  });

  it('sorts mock results by the requested ordering', async () => {
    const result = await perRepresentative.getPerRepresentative({
      ordering: 'conversations',
      limit: 1,
      offset: 0,
    });

    expect(result.results[0].representative.name).toBe('Renato Cunha');
    expect(result.results[0].conversations).toBe(162);
  });
});
