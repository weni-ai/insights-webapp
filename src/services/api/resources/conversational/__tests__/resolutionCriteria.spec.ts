import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/api/nexusHttp');
vi.mock('@/store/modules/config');
vi.mock('@/services/api/resources/projects', () => ({
  default: {
    verifyProjectIndexer: vi.fn(),
  },
}));

import resolutionCriteriaService, {
  parseCriterionError,
} from '../resolutionCriteria';
import nexusHttp from '@/services/api/nexusHttp';
import { useConfig } from '@/store/modules/config';

describe('resolutionCriteria service', () => {
  const mockProject = { uuid: 'test-project-uuid' };

  beforeEach(() => {
    vi.clearAllMocks();
    useConfig.mockReturnValue({ project: mockProject });
  });

  describe('getResolutionCriteria', () => {
    it('calls nexusHttp.get with the correct endpoint', async () => {
      const mockResponse = { base_criteria: [], custom_criteria: [] };
      nexusHttp.get.mockResolvedValueOnce(mockResponse);

      const result = await resolutionCriteriaService.getResolutionCriteria();

      expect(nexusHttp.get).toHaveBeenCalledWith(
        `/api/${mockProject.uuid}/ai-resolution-criteria/`,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateCriterion', () => {
    it('calls nexusHttp.post with text and criterion_id', async () => {
      const mockResponse = {
        validation: { status: true, message: 'ok' },
      };
      nexusHttp.post.mockResolvedValueOnce(mockResponse);

      const result = await resolutionCriteriaService.validateCriterion({
        text: 'Test criterion',
        criterionId: 'criterion-uuid',
      });

      expect(nexusHttp.post).toHaveBeenCalledWith(
        `/api/${mockProject.uuid}/ai-validation-criteria/`,
        {
          text: 'Test criterion',
          criterion_id: 'criterion-uuid',
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createCriterion', () => {
    it('calls nexusHttp.post with text body', async () => {
      const mockResponse = { id: 'new-id', text: 'New criterion' };
      nexusHttp.post.mockResolvedValueOnce(mockResponse);

      const result = await resolutionCriteriaService.createCriterion({
        text: 'New criterion',
      });

      expect(nexusHttp.post).toHaveBeenCalledWith(
        `/api/${mockProject.uuid}/ai-resolution-criteria/`,
        { text: 'New criterion' },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateCriterion', () => {
    it('calls nexusHttp.patch with text body', async () => {
      const mockResponse = { id: 'criterion-id', text: 'Updated criterion' };
      nexusHttp.patch.mockResolvedValueOnce(mockResponse);

      const result = await resolutionCriteriaService.updateCriterion(
        'criterion-id',
        { text: 'Updated criterion' },
      );

      expect(nexusHttp.patch).toHaveBeenCalledWith(
        `/api/${mockProject.uuid}/ai-resolution-criteria/criterion-id/`,
        { text: 'Updated criterion' },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteCriterion', () => {
    it('calls nexusHttp.delete with the correct endpoint', async () => {
      const mockResponse = { success: true };
      nexusHttp.delete.mockResolvedValueOnce(mockResponse);

      const result =
        await resolutionCriteriaService.deleteCriterion('criterion-id');

      expect(nexusHttp.delete).toHaveBeenCalledWith(
        `/api/${mockProject.uuid}/ai-resolution-criteria/criterion-id/`,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('parseCriterionError', () => {
    it('parses API error response', () => {
      const parsed = parseCriterionError({
        status: 400,
        data: {
          error: {
            code: 'DUPLICATE_CRITERION',
            message: 'Duplicate criterion',
          },
        },
      });

      expect(parsed).toEqual({
        status: 400,
        code: 'DUPLICATE_CRITERION',
        message: 'Duplicate criterion',
      });
    });

    it('returns fallback values for unknown errors', () => {
      const parsed = parseCriterionError({});

      expect(parsed.status).toBe(500);
      expect(parsed.code).toBe('LAMBDA_VALIDATION_FAILED');
    });
  });
});
