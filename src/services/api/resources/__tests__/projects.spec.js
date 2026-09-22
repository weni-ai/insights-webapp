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

  describe('getProjectSource pagination branches', () => {
    it('returns paginated shape when isPaginated and next/previous exist', async () => {
      http.get.mockResolvedValueOnce({
        next: 'next-url',
        previous: null,
        results: [{ uuid: '1', name: 'Source 1', extra: 'x' }],
      });

      const result = await SourceService.getProjectSource('slug', {}, true);

      expect(result).toEqual({
        next: 'next-url',
        previous: null,
        results: [{ uuid: '1', name: 'Source 1', extra: 'x' }],
      });
    });

    it('returns array response as-is when API returns an array', async () => {
      const arrayResponse = [{ uuid: '1', name: 'A' }];
      http.get.mockResolvedValueOnce(arrayResponse);

      await expect(SourceService.getProjectSource('slug')).resolves.toEqual(
        arrayResponse,
      );
    });
  });

  describe('getProjectSourcePaginated', () => {
    it('throws when url is missing', async () => {
      await expect(SourceService.getProjectSourcePaginated()).rejects.toThrow(
        'Please provide a valid URL for paginated request.',
      );
    });

    it('maps paginated results from url', async () => {
      http.get.mockResolvedValueOnce({
        next: null,
        previous: 'prev',
        results: [{ uuid: '2', name: 'Source 2', extra: true }],
      });

      const result = await SourceService.getProjectSourcePaginated(
        '/projects/x/sources/y/search/?page=2',
      );

      expect(http.get).toHaveBeenCalledWith(
        '/projects/x/sources/y/search/?page=2',
      );
      expect(result).toEqual({
        next: null,
        previous: 'prev',
        results: [{ uuid: '2', name: 'Source 2', extra: true }],
      });
    });
  });

  describe('remaining project endpoints', () => {
    it('getProjectManagers calls filters endpoint', async () => {
      http.get.mockResolvedValueOnce([{ email: 'a@b.com' }]);

      const result = await SourceService.getProjectManagers();

      expect(http.get).toHaveBeenCalledWith(
        '/projects/mock-project-uuid/filters/project_managers/',
      );
      expect(result).toEqual([{ email: 'a@b.com' }]);
    });

    it('verifyProjectCsat calls verify_csat endpoint', async () => {
      http.get.mockResolvedValueOnce({ enabled: true });

      const result = await SourceService.verifyProjectCsat();

      expect(http.get).toHaveBeenCalledWith(
        '/projects/mock-project-uuid/verify_csat/',
      );
      expect(result).toEqual({ enabled: true });
    });

    it('verifyProjectAbandonedCartRecovery calls commerce status', async () => {
      http.get.mockResolvedValueOnce({ status: 'ok' });

      const result = await SourceService.verifyProjectAbandonedCartRecovery();

      expect(http.get).toHaveBeenCalledWith(
        '/commerce/abandoned-cart/status/',
        { params: { project_uuid: 'mock-project-uuid' } },
      );
      expect(result).toEqual({ status: 'ok' });
    });

    it('getMarketingTemplateCost calls marketing pricing', async () => {
      http.get.mockResolvedValueOnce({ cost: 1.5 });

      const result = await SourceService.getMarketingTemplateCost();

      expect(http.get).toHaveBeenCalledWith('/commerce/marketing-pricing/', {
        params: { project_uuid: 'mock-project-uuid' },
      });
      expect(result).toEqual({ cost: 1.5 });
    });
  });
});
