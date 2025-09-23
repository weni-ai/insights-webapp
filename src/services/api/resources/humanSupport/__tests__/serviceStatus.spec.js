import { describe, it, expect, beforeEach, vi } from 'vitest';
import serviceStatus from '../serviceStatus';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { useHumanSupportMonitoring } from '@/store/modules/humanSupport/monitoring';
import { createRequestQuery } from '@/utils/request';

vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');
vi.mock('@/store/modules/humanSupport/monitoring');
vi.mock('@/utils/request');

describe('serviceStatus API', () => {
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
      is_awaiting: 25,
      in_progress: 10,
      finished: 65,
    };

    useConfig.mockReturnValue({ project: mockProject });
    useHumanSupportMonitoring.mockReturnValue({
      appliedFilters: mockAppliedFilters,
    });
    createRequestQuery.mockReturnValue({ formatted: 'params' });
    http.get.mockResolvedValue(mockHttpResponse);
  });

  describe('getServiceStatusData', () => {
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

        const result = await serviceStatus.getServiceStatusData(queryParams);

        expect(createRequestQuery).toHaveBeenCalledWith(queryParams);
        expect(http.get).toHaveBeenCalledWith('/monitoring/list_status/', {
          params: expectedParams,
        });
        expect(result).toEqual(mockHttpResponse);
      });
    });

    it('should handle empty applied filters', async () => {
      const emptyFilters = { sectors: [], queues: [], tags: [] };
      useHumanSupportMonitoring.mockReturnValue({
        appliedFilters: emptyFilters,
      });

      await serviceStatus.getServiceStatusData();

      expect(http.get).toHaveBeenCalledWith('/monitoring/list_status/', {
        params: {
          project_uuid: 'test-project-uuid',
          sectors: [],
          queues: [],
          tags: [],
          formatted: 'params',
        },
      });
    });

    it('should return formatted response data', async () => {
      const customResponse = {
        is_awaiting: 100,
        in_progress: 50,
        finished: 200,
      };
      http.get.mockResolvedValue(customResponse);

      const result = await serviceStatus.getServiceStatusData();

      expect(result).toEqual(customResponse);
      expect(result).toHaveProperty('is_awaiting');
      expect(result).toHaveProperty('in_progress');
      expect(result).toHaveProperty('finished');
    });

    it('should propagate API errors', async () => {
      const apiError = new Error('API request failed');
      http.get.mockRejectedValue(apiError);

      await expect(serviceStatus.getServiceStatusData()).rejects.toThrow(
        'API request failed',
      );
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

      await serviceStatus.getServiceStatusData();

      expect(http.get).toHaveBeenCalledWith('/monitoring/list_status/', {
        params: expect.objectContaining({
          sectors: [null, undefined, 'valid'],
          queues: [''],
          tags: ['tag1'],
        }),
      });
    });

    describe('parameter merging', () => {
      it('should correctly merge applied filters with query params', async () => {
        const queryParams = { date_from: '2023-01-01', date_to: '2023-12-31' };
        createRequestQuery.mockReturnValue(queryParams);

        await serviceStatus.getServiceStatusData(queryParams);

        expect(http.get).toHaveBeenCalledWith('/monitoring/list_status/', {
          params: {
            project_uuid: 'test-project-uuid',
            sectors: ['sector1', 'sector2'],
            queues: ['queue1'],
            tags: ['tag1', 'tag2', 'tag3'],
            date_from: '2023-01-01',
            date_to: '2023-12-31',
          },
        });
      });

      it('should override applied filters when query params have same keys', async () => {
        const queryParams = { sectors: ['override'] };
        createRequestQuery.mockReturnValue(queryParams);

        await serviceStatus.getServiceStatusData(queryParams);

        expect(http.get).toHaveBeenCalledWith('/monitoring/list_status/', {
          params: expect.objectContaining({
            sectors: ['override'],
          }),
        });
      });
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle missing project configuration', async () => {
      useConfig.mockReturnValue({ project: null });

      await expect(serviceStatus.getServiceStatusData()).rejects.toThrow(
        "Cannot read properties of null (reading 'uuid')",
      );
    });

    it('should handle missing monitoring store', async () => {
      useHumanSupportMonitoring.mockReturnValue({
        appliedFilters: null,
      });

      await expect(serviceStatus.getServiceStatusData()).rejects.toThrow();
    });

    it('should handle network timeouts and connection errors', async () => {
      const networkError = new Error('Network timeout');
      networkError.code = 'NETWORK_TIMEOUT';
      http.get.mockRejectedValue(networkError);

      await expect(serviceStatus.getServiceStatusData()).rejects.toThrow(
        'Network timeout',
      );
    });
  });
});
