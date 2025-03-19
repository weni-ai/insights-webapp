import http from '@/services/api/http';
import Config from '@/store/modules/config';
import { createRequestQuery } from '@/utils/request';

export default {
  async getMetrics(queryParams = {}, token) {
    const { project } = Config.state;

    const defaultParams = {
      skill: 'abandoned_cart',
      project_uuid: project.uuid,
    };

    const params = createRequestQuery({
      ...defaultParams,
      ...queryParams,
    });

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await http.get(`/metrics/skills/`, { params, headers });

    return response;
  },
};
