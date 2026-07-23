import { defineStore } from 'pinia';
import { ref } from 'vue';
import FeatureFlag from '@/services/api/resources/featureFlag/featureFlag';

export const useFeatureFlag = defineStore('featureFlag', () => {
  const activeFeatures = ref<string[]>([]);
  const isLoadingFeatureFlags = ref<boolean>(false);

  const getFeatureFlags = async (): Promise<void> => {
    try {
      isLoadingFeatureFlags.value = true;
      const response = await FeatureFlag.getAllFeatureFlags();
      activeFeatures.value = response.active_features || [];
    } catch (error) {
      console.error('Error getting feature flags', error);
      activeFeatures.value = [];
    } finally {
      isLoadingFeatureFlags.value = false;
    }
  };

  const isFeatureFlagEnabled = (flagName: string): boolean => {
    return activeFeatures.value.includes(flagName);
  };

  return {
    activeFeatures,
    isLoadingFeatureFlags,

    getFeatureFlags,

    isFeatureFlagEnabled,
  };
});
