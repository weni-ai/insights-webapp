import { beforeEach, describe, expect, it, vi } from 'vitest';

import conversions from '../conversions';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useCTWA } from '@/store/modules/ctwa';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/ctwa');
vi.mock('@/utils/request');

describe('CTWA conversions API', () => {
  const mockApiResponse = {
    conversations_started: { total: 19400, percentage: 100 },
    conversations_qualified: { total: 7180, percentage: 37.4 },
    conversations_converted: { total: 2880, percentage: 14.8 },
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

  it('calls the conversions endpoint with date range params', async () => {
    const result = await conversions.getConversionsData();

    expect(http.get).toHaveBeenCalledWith(
      '/projects/test-project-uuid/ctwa/conversions/',
      {
        params: {
          start_date: '2026-01-01',
          end_date: '2026-01-31',
        },
      },
    );
    expect(result).toEqual(mockApiResponse);
  });

  it('includes campaign when it is present in applied filters', async () => {
    useCTWA.mockReturnValue({
      appliedFilters: {
        start_date: '2026-01-01',
        end_date: '2026-01-31',
        campaign: 'campaign-uuid',
      },
    });

    await conversions.getConversionsData();

    expect(http.get).toHaveBeenCalledWith(
      '/projects/test-project-uuid/ctwa/conversions/',
      {
        params: {
          start_date: '2026-01-01',
          end_date: '2026-01-31',
          campaign: 'campaign-uuid',
        },
      },
    );
  });

  it('maps missing stages to null totals and percentages', async () => {
    http.get.mockResolvedValue({});

    const result = await conversions.getConversionsData();

    expect(result).toEqual({
      conversations_started: { total: null, percentage: null },
      conversations_qualified: { total: null, percentage: null },
      conversations_converted: { total: null, percentage: null },
    });
  });

  it('merges custom query params', async () => {
    createRequestQuery.mockReturnValue({ campaign: 'override' });

    await conversions.getConversionsData({ campaign: 'override' });

    expect(http.get).toHaveBeenCalledWith(
      '/projects/test-project-uuid/ctwa/conversions/',
      {
        params: expect.objectContaining({
          campaign: 'override',
        }),
      },
    );
  });

  it('propagates API errors', async () => {
    http.get.mockRejectedValue(new Error('Request failed'));

    await expect(conversions.getConversionsData()).rejects.toThrow(
      'Request failed',
    );
  });
});
