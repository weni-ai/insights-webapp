import { describe, it, expect, beforeEach, vi } from 'vitest';
import servicesOpenByHour from '../servicesOpenByHour';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/humanSupport/monitoring');
vi.mock('@/utils/request');

describe('servicesOpenByHour API', () => {
  let mockProject;
  let mockAppliedFilters;
  let mockHttpResponse;

  beforeEach(() => {
    vi.clearAllMocks();

    mockProject = { uuid: 'test-project-uuid' };
    mockAppliedFilters = {
      sectors: [{ value: 'sector1' }, { value: 'sector2' }],
      queues: [{ value: 'queue1' }],
      tags: [{ value: 'tag1' }, { value: 'tag2' }, { value: 'tag3' }],
    };

    mockHttpResponse = {
      data: [
        { label: '00:00', value: 15 },
        { label: '01:00', value: 8 },
        { label: '02:00', value: 5 },
        { label: '08:00', value: 45 },
        { label: '14:00', value: 78 },
        { label: '20:00', value: 32 },
      ],
    };

    useConfig.mockReturnValue({ project: mockProject });
    useHumanSupportMonitoring.mockReturnValue({
      appliedFilters: mockAppliedFilters,
    });
    createRequestQuery.mockReturnValue({ formatted: 'params' });
    http.get.mockResolvedValue(mockHttpResponse);
  });

  describe('getServicesOpenByHourData', () => {
    const testCases = [
      {
        name: 'with no query parameters',
        queryParams: {},
        expectedParams: {
          project_uuid: 'test-project-uuid',
          sectors: ['sector1', 'sector2'],
          queues: ['queue1'],
          tags: ['tag1', 'tag2', 'tag3'],
          formatted: 'params',
        },
      },
      {
        name: 'with custom query parameters',
        queryParams: { customParam: 'value', anotherParam: 123 },
        expectedParams: {
          project_uuid: 'test-project-uuid',
          sectors: ['sector1', 'sector2'],
          queues: ['queue1'],
          tags: ['tag1', 'tag2', 'tag3'],
          formatted: 'params',
        },
      },
    ];

    testCases.forEach(({ name, queryParams, expectedParams }) => {
      it(`should make correct API call ${name}`, async () => {
        createRequestQuery.mockReturnValue({ formatted: 'params' });

        const result =
          await servicesOpenByHour.getServicesOpenByHourData(queryParams);

        expect(createRequestQuery).toHaveBeenCalledWith(queryParams);
        expect(http.get).toHaveBeenCalledWith(
          '/monitoring/peaks_in_human_service/',
          {
            params: expectedParams,
          },
        );
        expect(result).toEqual(mockHttpResponse.data);
      });
    });

    it('should handle empty applied filters', async () => {
      const emptyFilters = { sectors: [], queues: [], tags: [] };
      useHumanSupportMonitoring.mockReturnValue({
        appliedFilters: emptyFilters,
      });

      await servicesOpenByHour.getServicesOpenByHourData();

      expect(http.get).toHaveBeenCalledWith(
        '/monitoring/peaks_in_human_service/',
        {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: [],
            queues: [],
            tags: [],
            formatted: 'params',
          },
        },
      );
    });

    it('should return formatted response data', async () => {
      const customResponse = {
        data: [
          { label: '09:00', value: 120 },
          { label: '15:00', value: 95 },
        ],
      };
      http.get.mockResolvedValue(customResponse);

      const result = await servicesOpenByHour.getServicesOpenByHourData();

      expect(result).toEqual(customResponse.data);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('label');
      expect(result[0]).toHaveProperty('value');
    });

    it('should propagate API errors', async () => {
      const apiError = new Error('API request failed');
      http.get.mockRejectedValue(apiError);

      await expect(
        servicesOpenByHour.getServicesOpenByHourData(),
      ).rejects.toThrow('API request failed');
    });

    it('should handle malformed filter data gracefully', async () => {
      const malformedFilters = {
        sectors: [{ value: null }, { value: undefined }, { value: 'valid' }],
        queues: [{ value: '' }],
        tags: [{ value: 'tag1' }],
      };
      useHumanSupportMonitoring.mockReturnValue({
        appliedFilters: malformedFilters,
      });

      await servicesOpenByHour.getServicesOpenByHourData();

      expect(http.get).toHaveBeenCalledWith(
        '/monitoring/peaks_in_human_service/',
        {
          params: expect.objectContaining({
            sectors: [null, undefined, 'valid'],
            queues: [''],
            tags: ['tag1'],
          }),
        },
      );
    });

    describe('parameter merging', () => {
      it('should correctly merge applied filters with query params', async () => {
        const queryParams = { date_from: '2023-01-01', date_to: '2023-12-31' };
        createRequestQuery.mockReturnValue(queryParams);

        await servicesOpenByHour.getServicesOpenByHourData(queryParams);

        expect(http.get).toHaveBeenCalledWith(
          '/monitoring/peaks_in_human_service/',
          {
            params: {
              project_uuid: 'test-project-uuid',
              sectors: ['sector1', 'sector2'],
              queues: ['queue1'],
              tags: ['tag1', 'tag2', 'tag3'],
              date_from: '2023-01-01',
              date_to: '2023-12-31',
            },
          },
        );
      });

      it('should override applied filters when query params have same keys', async () => {
        const queryParams = { sectors: ['override'] };
        createRequestQuery.mockReturnValue(queryParams);

        await servicesOpenByHour.getServicesOpenByHourData(queryParams);

        expect(http.get).toHaveBeenCalledWith(
          '/monitoring/peaks_in_human_service/',
          {
            params: expect.objectContaining({
              sectors: ['override'],
            }),
          },
        );
      });
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle missing project configuration', async () => {
      useConfig.mockReturnValue({ project: null });

      await expect(
        servicesOpenByHour.getServicesOpenByHourData(),
      ).rejects.toThrow("Cannot read properties of null (reading 'uuid')");
    });

    it('should handle missing monitoring store', async () => {
      useHumanSupportMonitoring.mockReturnValue({
        appliedFilters: null,
      });

      await expect(
        servicesOpenByHour.getServicesOpenByHourData(),
      ).rejects.toThrow();
    });

    it('should handle network timeouts and connection errors', async () => {
      const networkError = new Error('Network timeout');
      networkError.code = 'NETWORK_TIMEOUT';
      http.get.mockRejectedValue(networkError);

      await expect(
        servicesOpenByHour.getServicesOpenByHourData(),
      ).rejects.toThrow('Network timeout');
    });

    it('should handle empty response data array', async () => {
      const emptyResponse = { data: [] };
      http.get.mockResolvedValue(emptyResponse);

      const result = await servicesOpenByHour.getServicesOpenByHourData();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle response with invalid data structure', async () => {
      const invalidResponse = { data: null };
      http.get.mockResolvedValue(invalidResponse);

      const result = await servicesOpenByHour.getServicesOpenByHourData();

      expect(result).toBeNull();
    });
  });
});
