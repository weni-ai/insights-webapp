import { describe, it, expect, vi, beforeEach } from 'vitest';
import metrics from '../metrics';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';

// Mock the dependencies
vi.mock('@/services/api/http');
vi.mock('@/store/modules/config');

describe('Metrics Service', () => {
  const mockProject = {
    uuid: 'test-project-uuid',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock useConfig implementation
    useConfig.mockReturnValue({
      project: mockProject,
    });
  });

  describe('getMetrics', () => {
    it('should call http.get with correct parameters when no token is provided', async () => {
      const mockResponse = { data: { metrics: [] } };
      http.get.mockResolvedValueOnce(mockResponse);

      const queryParams = { date: '2024-03-20' };
      const result = await metrics.getMetrics(queryParams);

      expect(http.get).toHaveBeenCalledWith('/metrics/skills/', {
        params: {
          skill: 'abandoned_cart',
          project_uuid: mockProject.uuid,
          date: '2024-03-20',
        },
        headers: {},
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call http.get with authorization header when token is provided', async () => {
      const mockResponse = { data: { metrics: [] } };
      http.get.mockResolvedValueOnce(mockResponse);

      const token = 'test-token';
      const result = await metrics.getMetrics({}, token);

      expect(http.get).toHaveBeenCalledWith('/metrics/skills/', {
        params: {
          skill: 'abandoned_cart',
          project_uuid: mockProject.uuid,
        },
        headers: {
          Authorization: 'Bearer test-token',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors from http.get', async () => {
      const mockError = new Error('API Error');
      http.get.mockRejectedValueOnce(mockError);

      await expect(metrics.getMetrics()).rejects.toThrow('API Error');
    });
  });
});
