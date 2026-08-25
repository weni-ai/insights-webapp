import { describe, it, expect, vi, beforeEach } from 'vitest';

import SourceService from '../projects';
import http from '@/services/api/http';
import weniHttp from '@/services/api/weniHttp';

vi.mock('@/services/api/http', () => ({
  default: { get: vi.fn() },
}));

vi.mock('@/services/api/weniHttp', () => ({
  default: { get: vi.fn() },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: () => ({ project: { uuid: 'mock-project-uuid' } }),
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

  describe('getMetaCampaigns', () => {
    it('should call the API with the campaign source URL and search param', async () => {
      const mockResponse = {
        results: [{ uuid: 'campaign-1', name: 'Campaign 1' }],
        count: 1,
      };
      http.get.mockResolvedValueOnce(mockResponse);

      const campaigns = await SourceService.getMetaCampaigns({
        search: 'Campaign',
      });

      expect(http.get).toHaveBeenCalledWith(
        '/projects/mock-project-uuid/sources/meta/campaign/',
        { params: { search: 'Campaign' } },
      );
      expect(campaigns).toEqual({
        count: 1,
        results: [{ uuid: 'campaign-1', name: 'Campaign 1' }],
      });
    });

    it('should call the API with limit and offset', async () => {
      http.get.mockResolvedValueOnce({
        results: [{ uuid: 'campaign-1', name: 'Campaign 1' }],
        count: 10,
      });

      await SourceService.getMetaCampaigns({
        limit: 20,
        offset: 20,
      });

      expect(http.get).toHaveBeenCalledWith(
        '/projects/mock-project-uuid/sources/meta/campaign/',
        { params: { limit: 20, offset: 20 } },
      );
    });

    it('should handle empty results', async () => {
      http.get.mockResolvedValueOnce({});

      const campaigns = await SourceService.getMetaCampaigns();

      expect(campaigns).toEqual({
        count: null,
        results: [],
      });
    });
  });

  describe('getProjectInfo', () => {
    it('should call the Weni API with the project endpoint', async () => {
      const mockResponse = {
        uuid: 'mock-project-uuid',
        name: 'Test Project',
      };
      weniHttp.get.mockResolvedValueOnce(mockResponse);

      const project = await SourceService.getProjectInfo();

      expect(weniHttp.get).toHaveBeenCalledWith(
        '/organization/project/mock-project-uuid/',
      );
      expect(project).toEqual(mockResponse);
    });
  });
});
