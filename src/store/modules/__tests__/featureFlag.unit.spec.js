import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFeatureFlag } from '../featureFlag';
import FeatureFlag from '@/services/api/resources/featureFlag/featureFlag';
import { flushPromises } from '@vue/test-utils';

vi.mock('@/services/api/resources/featureFlag/featureFlag', () => ({
  default: {
    getAllFeatureFlags: vi.fn(),
  },
}));

describe('useFeatureFlag store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useFeatureFlag();

      expect(store.activeFeatures).toEqual([]);
      expect(store.isLoadingFeatureFlags).toBe(false);
    });
  });

  describe('getFeatureFlags action', () => {
    it('should fetch and set feature flags successfully', async () => {
      const store = useFeatureFlag();

      const mockResponse = {
        active_features: [
          'weniChatsFeedback',
          'weniChatsTestFlag',
          'weniChatsAutomaticMessage',
        ],
      };

      FeatureFlag.getAllFeatureFlags.mockResolvedValue(mockResponse);

      await store.getFeatureFlags();

      expect(FeatureFlag.getAllFeatureFlags).toHaveBeenCalled();
      expect(store.activeFeatures).toEqual([
        'weniChatsFeedback',
        'weniChatsTestFlag',
        'weniChatsAutomaticMessage',
      ]);
      expect(store.isLoadingFeatureFlags).toBe(false);
    });

    it('should handle empty active_features array', async () => {
      const store = useFeatureFlag();

      const mockResponse = {
        active_features: [],
      };

      FeatureFlag.getAllFeatureFlags.mockResolvedValue(mockResponse);

      await store.getFeatureFlags();

      expect(FeatureFlag.getAllFeatureFlags).toHaveBeenCalled();
      expect(store.activeFeatures).toEqual([]);
      expect(store.isLoadingFeatureFlags).toBe(false);
    });

    it('should handle missing active_features property', async () => {
      const store = useFeatureFlag();

      const mockResponse = {};

      FeatureFlag.getAllFeatureFlags.mockResolvedValue(mockResponse);

      await store.getFeatureFlags();

      expect(FeatureFlag.getAllFeatureFlags).toHaveBeenCalled();
      expect(store.activeFeatures).toEqual([]);
      expect(store.isLoadingFeatureFlags).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      const store = useFeatureFlag();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('API Error');
      FeatureFlag.getAllFeatureFlags.mockRejectedValue(mockError);

      await store.getFeatureFlags();

      expect(FeatureFlag.getAllFeatureFlags).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting feature flags',
        mockError,
      );
      expect(store.activeFeatures).toEqual([]);
      expect(store.isLoadingFeatureFlags).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should set loading state during fetch', async () => {
      const store = useFeatureFlag();

      FeatureFlag.getAllFeatureFlags.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ active_features: [] }), 100),
          ),
      );

      const promise = store.getFeatureFlags();
      expect(store.isLoadingFeatureFlags).toBe(true);

      await promise;
      expect(store.isLoadingFeatureFlags).toBe(false);
    });

    it('should reset loading state even on error', async () => {
      const store = useFeatureFlag();
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      FeatureFlag.getAllFeatureFlags.mockRejectedValue(new Error('API Error'));

      await store.getFeatureFlags();

      expect(store.isLoadingFeatureFlags).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('isFeatureFlagEnabled getter', () => {
    it('should return true when feature flag is active', () => {
      const store = useFeatureFlag();

      store.activeFeatures = [
        'weniChatsFeedback',
        'weniChatsTestFlag',
        'weniChatsAutomaticMessage',
      ];

      expect(store.isFeatureFlagEnabled('weniChatsFeedback')).toBe(true);
      expect(store.isFeatureFlagEnabled('weniChatsTestFlag')).toBe(true);
      expect(store.isFeatureFlagEnabled('weniChatsAutomaticMessage')).toBe(
        true,
      );
    });

    it('should return false when feature flag is not active', () => {
      const store = useFeatureFlag();

      store.activeFeatures = ['weniChatsFeedback', 'weniChatsTestFlag'];

      expect(store.isFeatureFlagEnabled('nonExistentFlag')).toBe(false);
      expect(store.isFeatureFlagEnabled('weniChatsAutomaticMessage')).toBe(
        false,
      );
    });

    it('should return false when no feature flags are active', () => {
      const store = useFeatureFlag();

      store.activeFeatures = [];

      expect(store.isFeatureFlagEnabled('anyFlag')).toBe(false);
    });

    it('should be case sensitive', () => {
      const store = useFeatureFlag();

      store.activeFeatures = ['weniChatsFeedback'];

      expect(store.isFeatureFlagEnabled('weniChatsFeedback')).toBe(true);
      expect(store.isFeatureFlagEnabled('WENICHATSFEEDBACK')).toBe(false);
      expect(store.isFeatureFlagEnabled('weniChatsfeedback')).toBe(false);
    });

    it('should handle empty string flag name', () => {
      const store = useFeatureFlag();

      store.activeFeatures = ['weniChatsFeedback'];

      expect(store.isFeatureFlagEnabled('')).toBe(false);
    });

    it('should handle undefined flag name gracefully', () => {
      const store = useFeatureFlag();

      store.activeFeatures = ['weniChatsFeedback'];

      expect(store.isFeatureFlagEnabled(undefined)).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should work end-to-end with real API response', async () => {
      const store = useFeatureFlag();

      const mockResponse = {
        active_features: ['weniChatsFeedback', 'weniChatsTestFlag'],
      };

      FeatureFlag.getAllFeatureFlags.mockResolvedValue(mockResponse);

      expect(store.isFeatureFlagEnabled('weniChatsFeedback')).toBe(false);

      await store.getFeatureFlags();
      await flushPromises();

      expect(store.isFeatureFlagEnabled('weniChatsFeedback')).toBe(true);
      expect(store.isFeatureFlagEnabled('weniChatsTestFlag')).toBe(true);
      expect(store.isFeatureFlagEnabled('weniChatsAutomaticMessage')).toBe(
        false,
      );
    });

    it('should maintain state consistency across multiple calls', async () => {
      const store = useFeatureFlag();

      FeatureFlag.getAllFeatureFlags.mockResolvedValueOnce({
        active_features: ['flag1', 'flag2'],
      });

      await store.getFeatureFlags();
      expect(store.activeFeatures).toEqual(['flag1', 'flag2']);

      FeatureFlag.getAllFeatureFlags.mockResolvedValueOnce({
        active_features: ['flag3'],
      });

      await store.getFeatureFlags();
      expect(store.activeFeatures).toEqual(['flag3']);
      expect(store.isFeatureFlagEnabled('flag1')).toBe(false);
      expect(store.isFeatureFlagEnabled('flag3')).toBe(true);
    });
  });
});
