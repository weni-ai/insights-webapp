import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import featureFlagService from '../featureFlag';
import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';

vi.mock('@/services/api/http', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('@/store/modules/config', () => ({
  useConfig: vi.fn(),
}));

describe('featureFlagService', () => {
  const mockProjectUuid = 'test-project-uuid';
  const mockApiError = new Error('Network Error');

  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());

    useConfig.mockReturnValue({ project: { uuid: mockProjectUuid } });
  });

  describe('getAllFeatureFlags', () => {
    const mockApiResponse = {
      active_features: [
        'weniChatsFeedback',
        'weniChatsTestFlag',
        'weniChatsAutomaticMessage',
      ],
    };

    it('should fetch feature flags successfully', async () => {
      http.get.mockResolvedValue({ data: mockApiResponse });

      const result = await featureFlagService.getAllFeatureFlags();

      expect(http.get).toHaveBeenCalledWith('/feature_flags/', {
        params: {
          project_uuid: mockProjectUuid,
        },
      });

      expect(result).toEqual(mockApiResponse);
      expect(result.active_features).toHaveLength(3);
      expect(result.active_features).toContain('weniChatsFeedback');
      expect(result.active_features).toContain('weniChatsTestFlag');
      expect(result.active_features).toContain('weniChatsAutomaticMessage');
    });

    it('should handle empty feature flags response', async () => {
      const emptyResponse = { active_features: [] };
      http.get.mockResolvedValue({ data: emptyResponse });

      const result = await featureFlagService.getAllFeatureFlags();

      expect(http.get).toHaveBeenCalledWith('/feature_flags/', {
        params: {
          project_uuid: mockProjectUuid,
        },
      });

      expect(result).toEqual(emptyResponse);
      expect(result.active_features).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      http.get.mockRejectedValue(mockApiError);

      await expect(featureFlagService.getAllFeatureFlags()).rejects.toThrow(
        'Network Error',
      );

      expect(http.get).toHaveBeenCalledWith('/feature_flags/', {
        params: {
          project_uuid: mockProjectUuid,
        },
      });
    });

    it('should use correct project UUID from config', async () => {
      const customProjectUuid = 'custom-project-uuid';
      useConfig.mockReturnValue({ project: { uuid: customProjectUuid } });

      http.get.mockResolvedValue({ data: mockApiResponse });

      await featureFlagService.getAllFeatureFlags();

      expect(http.get).toHaveBeenCalledWith('/feature_flags/', {
        params: {
          project_uuid: customProjectUuid,
        },
      });
    });

    it('should handle malformed response gracefully', async () => {
      const malformedResponse = { data: { unexpected_field: 'value' } };
      http.get.mockResolvedValue(malformedResponse);

      const result = await featureFlagService.getAllFeatureFlags();

      expect(result).toEqual({ unexpected_field: 'value' });
    });
  });
});
