import { describe, it, expect, vi, beforeEach } from 'vitest';

import SourceService from '../projects';
import http from '@/services/api/http';

vi.mock('@/services/api/http', () => ({
  default: { get: vi.fn() },
}));

vi.mock('@/store/modules/config', () => ({
  default: {
    state: {
      project: { uuid: 'mock-project-uuid' },
    },
  },
}));

vi.mock('@/utils/request', () => ({
  createRequestQuery: vi.fn((params) => params),
}));

describe('Projects Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjectSource', () => {
    it('should throw an error if no slug is provided', async () => {
      await expect(SourceService.getProjectSource()).rejects.toThrow(
        'Please provide a valid id to request data of source.',
      );
    });

    it('should call the API with the correct URL and query parameters', async () => {
      const mockResponse = {
        results: [
          { uuid: '1', name: 'Source 1', extra: 'data' },
          { uuid: '2', name: 'Source 2', extra: 'data' },
        ],
      };
      http.get.mockResolvedValueOnce(mockResponse);

      const slug = 'mock-slug';
      const queryParams = { filter: 'test' };

      const sources = await SourceService.getProjectSource(slug, queryParams);

      expect(http.get).toHaveBeenCalledWith(
        '/projects/mock-project-uuid/sources/mock-slug/search/',
        { params: queryParams },
      );

      expect(sources).toEqual([
        { uuid: '1', name: 'Source 1', extra: 'data' },
        { uuid: '2', name: 'Source 2', extra: 'data' },
      ]);
    });

    it('should handle empty results correctly', async () => {
      const mockResponse = { results: [] };
      http.get.mockResolvedValueOnce(mockResponse);

      const slug = 'mock-slug';

      const sources = await SourceService.getProjectSource(slug);

      expect(sources).toEqual([]);
    });
  });

  describe('verifyProjectIndexer', () => {
    it('should call the API with the correct URL', async () => {
      const mockResponse = { status: 'success' };
      http.get.mockResolvedValueOnce(mockResponse);

      const response = await SourceService.verifyProjectIndexer();

      expect(http.get).toHaveBeenCalledWith(
        '/projects/mock-project-uuid/verify_project_indexer/',
      );

      expect(response).toEqual(mockResponse);
    });

    it('should propagate errors from the API', async () => {
      const mockError = new Error('API Error');
      http.get.mockRejectedValueOnce(mockError);

      await expect(SourceService.verifyProjectIndexer()).rejects.toThrow(
        'API Error',
      );
    });
  });
});
