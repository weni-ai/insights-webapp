import { describe, it, expect, beforeEach, vi } from 'vitest';
import timeMetrics from '../timeMetrics';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/humanSupport/monitoring');
vi.mock('@/utils/request');

describe('timeMetrics API', () => {
  let mockConfig;
  let mockMonitoringStore;
  let mockHttpResponse;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = { project: { uuid: 'test-uuid-123' } };
    mockMonitoringStore = {
      appliedFilters: {
        sectors: [{ value: 'support' }, { value: 'sales' }],
        queues: [{ value: 'priority' }],
        tags: [{ value: 'urgent' }],
      },
    };

    mockHttpResponse = {
      average_time_is_waiting: { average: 120, max: 300 },
      average_time_first_response: { average: 45, max: 90 },
      average_time_chat: { average: 600, max: 1200 },
    };

    useConfig.mockReturnValue(mockConfig);
    useHumanSupportMonitoring.mockReturnValue(mockMonitoringStore);
    createRequestQuery.mockReturnValue({});
    http.get.mockResolvedValue(mockHttpResponse);
  });

  describe('getTimeMetricsData', () => {
    it('should make API call with correct endpoint and parameters', async () => {
      const result = await timeMetrics.getTimeMetricsData();

      expect(http.get).toHaveBeenCalledWith(
        '/monitoring/average_time_metrics/',
        {
          params: {
            project_uuid: 'test-uuid-123',
            sectors: ['support', 'sales'],
            queues: ['priority'],
            tags: ['urgent'],
          },
        },
      );
      expect(result).toEqual(mockHttpResponse);
    });

    it('should handle custom query parameters', async () => {
      const queryParams = { start_date: '2023-01-01', end_date: '2023-12-31' };
      createRequestQuery.mockReturnValue(queryParams);

      await timeMetrics.getTimeMetricsData(queryParams);

      expect(createRequestQuery).toHaveBeenCalledWith(queryParams);
      expect(http.get).toHaveBeenCalledWith(
        '/monitoring/average_time_metrics/',
        {
          params: {
            project_uuid: 'test-uuid-123',
            sectors: ['support', 'sales'],
            queues: ['priority'],
            tags: ['urgent'],
            start_date: '2023-01-01',
            end_date: '2023-12-31',
          },
        },
      );
    });

    const responseDataTests = [
      {
        name: 'typical response data',
        response: {
          average_time_is_waiting: { average: 180, max: 450 },
          average_time_first_response: { average: 60, max: 120 },
          average_time_chat: { average: 900, max: 1800 },
        },
      },
      {
        name: 'zero values',
        response: {
          average_time_is_waiting: { average: 0, max: 0 },
          average_time_first_response: { average: 0, max: 0 },
          average_time_chat: { average: 0, max: 0 },
        },
      },
      {
        name: 'null values',
        response: {
          average_time_is_waiting: { average: null, max: null },
          average_time_first_response: { average: null, max: null },
          average_time_chat: { average: null, max: null },
        },
      },
    ];

    responseDataTests.forEach(({ name, response }) => {
      it(`should return formatted response for ${name}`, async () => {
        http.get.mockResolvedValue(response);

        const result = await timeMetrics.getTimeMetricsData();

        expect(result).toEqual(response);
        expect(result).toHaveProperty('average_time_is_waiting');
        expect(result).toHaveProperty('average_time_first_response');
        expect(result).toHaveProperty('average_time_chat');
      });
    });

    describe('filter handling', () => {
      const filterScenarios = [
        {
          name: 'empty filters',
          filters: { sectors: [], queues: [], tags: [] },
          expected: { sectors: [], queues: [], tags: [] },
        },
        {
          name: 'single filter values',
          filters: {
            sectors: [{ value: 'single' }],
            queues: [{ value: 'queue' }],
            tags: [{ value: 'tag' }],
          },
          expected: { sectors: ['single'], queues: ['queue'], tags: ['tag'] },
        },
        {
          name: 'multiple filter values',
          filters: {
            sectors: [{ value: 'a' }, { value: 'b' }, { value: 'c' }],
            queues: [{ value: '1' }, { value: '2' }],
            tags: [{ value: 'x' }, { value: 'y' }, { value: 'z' }],
          },
          expected: {
            sectors: ['a', 'b', 'c'],
            queues: ['1', '2'],
            tags: ['x', 'y', 'z'],
          },
        },
      ];

      filterScenarios.forEach(({ name, filters, expected }) => {
        it(`should correctly format ${name}`, async () => {
          useHumanSupportMonitoring.mockReturnValue({
            appliedFilters: filters,
          });

          await timeMetrics.getTimeMetricsData();

          expect(http.get).toHaveBeenCalledWith(
            '/monitoring/average_time_metrics/',
            {
              params: expect.objectContaining(expected),
            },
          );
        });
      });
    });

    describe('error scenarios', () => {
      const errorTests = [
        {
          name: 'API server error',
          error: new Error('Internal Server Error'),
          expectedMessage: 'Internal Server Error',
        },
        {
          name: 'network connectivity error',
          error: new Error('Network Error'),
          expectedMessage: 'Network Error',
        },
        {
          name: 'authentication error',
          error: new Error('Unauthorized'),
          expectedMessage: 'Unauthorized',
        },
      ];

      errorTests.forEach(({ name, error, expectedMessage }) => {
        it(`should handle ${name}`, async () => {
          http.get.mockRejectedValue(error);

          await expect(timeMetrics.getTimeMetricsData()).rejects.toThrow(
            expectedMessage,
          );
        });
      });
    });

    describe('parameter precedence', () => {
      it('should prioritize query params over applied filters', async () => {
        const queryParams = { sectors: ['override'], tags: ['custom'] };
        createRequestQuery.mockReturnValue(queryParams);

        await timeMetrics.getTimeMetricsData(queryParams);

        expect(http.get).toHaveBeenCalledWith(
          '/monitoring/average_time_metrics/',
          {
            params: {
              project_uuid: 'test-uuid-123',
              sectors: ['override'],
              queues: ['priority'],
              tags: ['custom'],
            },
          },
        );
      });

      it('should handle complex parameter merging', async () => {
        const complexQuery = {
          date_range: '7d',
          include_weekends: false,
          timezone: 'UTC',
          sectors: ['marketing'],
        };
        createRequestQuery.mockReturnValue(complexQuery);

        await timeMetrics.getTimeMetricsData(complexQuery);

        expect(http.get).toHaveBeenCalledWith(
          '/monitoring/average_time_metrics/',
          {
            params: {
              project_uuid: 'test-uuid-123',
              sectors: ['marketing'],
              queues: ['priority'],
              tags: ['urgent'],
              date_range: '7d',
              include_weekends: false,
              timezone: 'UTC',
            },
          },
        );
      });
    });

    describe('edge cases', () => {
      it('should handle missing project UUID', async () => {
        useConfig.mockReturnValue({ project: {} });

        await timeMetrics.getTimeMetricsData();

        expect(http.get).toHaveBeenCalledWith(
          '/monitoring/average_time_metrics/',
          {
            params: expect.objectContaining({
              project_uuid: undefined,
            }),
          },
        );
      });

      it('should handle malformed filter objects', async () => {
        const malformedFilters = {
          sectors: [{ value: null }, { wrongKey: 'value' }],
          queues: [{ value: undefined }],
          tags: [],
        };
        useHumanSupportMonitoring.mockReturnValue({
          appliedFilters: malformedFilters,
        });

        await timeMetrics.getTimeMetricsData();

        expect(http.get).toHaveBeenCalledWith(
          '/monitoring/average_time_metrics/',
          {
            params: expect.objectContaining({
              sectors: [null, undefined],
              queues: [undefined],
              tags: [],
            }),
          },
        );
      });

      it('should handle missing monitoring store data', async () => {
        useHumanSupportMonitoring.mockReturnValue({ appliedFilters: null });

        await expect(timeMetrics.getTimeMetricsData()).rejects.toThrow();
      });
    });
  });
});
