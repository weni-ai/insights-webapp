import { beforeEach, describe, expect, it, vi } from 'vitest';

import ctwaData from '../data';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useCTWA } from '@/store/modules/ctwa';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/ctwa');
vi.mock('@/utils/request');

describe('CTWA data API', () => {
  const mockApiResponse = {
    attributed_revenue: {
      value: 1030000,
      avg: 359,
    },
    ctwa_conversations: 19400,
    organic_conversations: 22800,
  };

  const expectedFormattedResponse = {
    attributed_revenue: {
      value: 1030000,
      avg: 359,
    },
    ctwa_conversations: 19400,
    organic_conversations: 22800,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useConfig.mockReturnValue({ project: { uuid: 'test-project-uuid' } });
    useCTWA.mockReturnValue({
      appliedFilters: {
        start_date: '2026-01-01',
        end_date: '2026-01-31',
      },
    });
    createRequestQuery.mockReturnValue({});
    http.get.mockResolvedValue(mockApiResponse);
  });

  it('calls the CTWA data endpoint with date range params', async () => {
    const result = await ctwaData.getDashboardData();

    expect(http.get).toHaveBeenCalledWith(
      '/projects/test-project-uuid/ctwa/data/',
      {
        params: {
          start_date: '2026-01-01',
          end_date: '2026-01-31',
        },
      },
    );
    expect(result).toEqual(expectedFormattedResponse);
  });

  it('maps the API typo ctwa_conversaAtions to ctwa_conversations', async () => {
    http.get.mockResolvedValue({
      attributed_revenue: { value: 100, avg: 10 },
      ctwa_conversaAtions: 50,
      organic_conversations: 80,
    });

    const result = await ctwaData.getDashboardData();

    expect(result.ctwa_conversations).toBe(50);
  });

  it('prefers ctwa_conversations when both fields are present', async () => {
    http.get.mockResolvedValue({
      attributed_revenue: { value: 100, avg: 10 },
      ctwa_conversations: 40,
      ctwa_conversaAtions: 50,
      organic_conversations: 80,
    });

    const result = await ctwaData.getDashboardData();

    expect(result.ctwa_conversations).toBe(40);
  });

  it('maps missing fields to null', async () => {
    http.get.mockResolvedValue({});

    const result = await ctwaData.getDashboardData();

    expect(result).toEqual({
      attributed_revenue: { value: null, avg: null },
      ctwa_conversations: null,
      organic_conversations: null,
    });
  });

  it('merges custom query params', async () => {
    createRequestQuery.mockReturnValue({ start_date: '2026-02-01' });

    await ctwaData.getDashboardData({ start_date: '2026-02-01' });

    expect(http.get).toHaveBeenCalledWith(
      '/projects/test-project-uuid/ctwa/data/',
      {
        params: expect.objectContaining({
          start_date: '2026-02-01',
        }),
      },
    );
  });

  it('includes campaign when it is present in applied filters', async () => {
    useCTWA.mockReturnValue({
      appliedFilters: {
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        campaign: 'campaign-uuid',
      },
    });

    await ctwaData.getDashboardData();

    expect(http.get).toHaveBeenCalledWith(
      '/projects/test-project-uuid/ctwa/data/',
      {
        params: {
          start_date: '2026-01-01',
          end_date: '2026-01-31',
          campaign: 'campaign-uuid',
        },
      },
    );
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(ctwaData.getDashboardData()).rejects.toThrow(
      'Request failed',
    );
  });
});
