import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';
import { createRequestQuery } from '@/utils/request';

export default {
  async getProjectSource(slug, queryParams = {}, isPaginated = false) {
    const { project } = useConfig();
    if (!slug) {
      throw new Error('Please provide a valid id to request data of source.');
    }

    const params = createRequestQuery(queryParams);

    const response = await http.get(
      `/projects/${project.uuid}/sources/${slug}/search/`,
      { params },
    );

    if (
      isPaginated &&
      (response.next !== undefined || response.previous !== undefined)
    ) {
      return {
        next: response.next,
        previous: response.previous,
        results: response.results.map((source) => ({
          uuid: source.uuid,
          name: source.name,
          ...source,
        })),
      };
    }

    const sources = response.results.map((source) => {
      return {
        uuid: source.uuid,
        name: source.name,
        ...source,
      };
    });

    return sources;
  },

  async getProjectSourcePaginated(url) {
    if (!url) {
      throw new Error('Please provide a valid URL for paginated request.');
    }

    const response = await http.get(url);

    return {
      next: response.next,
      previous: response.previous,
      results: response.results.map((source) => ({
        uuid: source.uuid,
        name: source.name,
        ...source,
      })),
    };
  },
  async verifyProjectIndexer() {
    const { project } = useConfig();
    const response = await http.get(
      `/projects/${project.uuid}/verify_project_indexer/`,
    );
    return response;
  },
};
