import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';

interface FeatureFlagResponse {
  active_features: string[];
}

export default {
  async getAllFeatureFlags(): Promise<FeatureFlagResponse> {
    const { project } = useConfig();

    const endpoint = '/feature_flags/';

    const response: FeatureFlagResponse = await http.get(endpoint, {
      params: {
        project_uuid: project.uuid,
      },
    });

    return response;
  },
};
