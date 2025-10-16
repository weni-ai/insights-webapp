import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { createRequestQuery } from '@/utils/request';
import { asyncTimeout } from '@/utils/time';

export default {
  async getProjectSource(slug, queryParams = {}) {
    const { project } = useConfig();
    if (!slug) {
      throw new Error('Please provide a valid id to request data of source.');
    }

    const params = createRequestQuery(queryParams);

    const response = await http.get(
      `/projects/${project.uuid}/sources/${slug}/search/`,
      { params },
    );

    const sources = response.results.map((source) => {
      return {
        uuid: source.uuid,
        name: source.name,
        ...source,
      };
    });

    return sources;
  },
  async verifyProjectIndexer() {
    const { project } = useConfig();
    const response = await http.get(
      `/projects/${project.uuid}/verify_project_indexer/`,
    );
    return response;
  },
  async verifyProjectCsat() {
    const { project } = useConfig();
    await asyncTimeout(1000);
    return { is_enabled: true };
    // const response = await http.get(`/projects/${project.uuid}/verify_csat/`);
    // return response.data;
  },
};
