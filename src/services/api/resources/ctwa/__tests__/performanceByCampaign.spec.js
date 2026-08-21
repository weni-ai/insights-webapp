import { beforeEach, describe, expect, it, vi } from 'vitest';

import performanceByCampaign from '../performanceByCampaign';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useCTWA } from '@/store/modules/ctwa';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/ctwa');
vi.mock('@/utils/request');

describe('CTWA performance by campaign API', () => {
  const mockApiResponse = {
    count: 2,
    results: [
      {
        label: {
          id: 'campaign-1',
          headline: 'Contractor Bulk Pricing',
        },
        conversations: 3200,
        qualified: 1450,
        conversions: 520,
        revenue: 509600,
      },
      {
        label: {
          id: 'campaign-2',
          headline: 'Pro Account Signup',
        },
        conversations: 2100,
        qualified: 780,
        conversions: 210,
        revenue: 134400,
      },
    ],
  };

  const mockMappedResponse = {
    count: 2,
    results: [
      {
        campaign: 'campaign-1 - Contractor Bulk Pricing',
        conversations: 3200,
        qualified: 1450,
        conversions: 520,
        revenue: 509600,
      },
      {
        campaign: 'campaign-2 - Pro Account Signup',
        conversations: 2100,
        qualified: 780,
        conversions: 210,
        revenue: 134400,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useConfig.mockReturnValue({ project: { uuid: 'test-project-uuid' } });
    useCTWA.mockReturnValue({
      appliedDateRange: {
        start: '2026-01-01',
        end: '2026-01-31',
      },
    });
    createRequestQuery.mockImplementation((params) => params);
    http.get.mockResolvedValue(mockApiResponse);
  });

  it('calls the performance endpoint with date range, limit and offset', async () => {
    const result = await performanceByCampaign.getPerformanceByCampaign({
      limit: 10,
      offset: 0,
    });

    expect(http.get).toHaveBeenCalledWith(
      '/projects/test-project-uuid/ctwa/performance_by_campaign/',
      {
        params: {
          start_date: '2026-01-01',
          end_date: '2026-01-31',
          limit: 10,
          offset: 0,
        },
      },
    );
    expect(result).toEqual(mockMappedResponse);
  });

  it('does not send campaign in the request params', async () => {
    await performanceByCampaign.getPerformanceByCampaign({
      limit: 10,
      offset: 0,
    });

    const [, options] = http.get.mock.calls[0];
    expect(options.params).not.toHaveProperty('campaign');
  });

  it('maps missing results to an empty list and count 0', async () => {
    http.get.mockResolvedValue({});

    const result = await performanceByCampaign.getPerformanceByCampaign();

    expect(result).toEqual({
      count: 0,
      results: [],
    });
  });

  it('falls back to results length when count is missing', async () => {
    http.get.mockResolvedValue({
      results: [
        {
          label: { id: 'bf-1', headline: 'Black friday' },
          conversations: 10,
        },
      ],
    });

    const result = await performanceByCampaign.getPerformanceByCampaign();

    expect(result.count).toBe(1);
    expect(result.results[0].campaign).toBe('bf-1 - Black friday');
  });

  it('maps missing numeric fields to null and missing label to a dash', async () => {
    http.get.mockResolvedValue({
      count: 1,
      results: [{}],
    });

    const result = await performanceByCampaign.getPerformanceByCampaign();

    expect(result.results[0]).toEqual({
      campaign: '-',
      conversations: null,
      qualified: null,
      conversions: null,
      revenue: null,
    });
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(
      performanceByCampaign.getPerformanceByCampaign(),
    ).rejects.toThrow('Request failed');
  });
});
