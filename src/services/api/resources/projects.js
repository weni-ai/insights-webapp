import http from '@/services/api/http';
import Config from '@/store/modules/config';
import Source from '@/models/Source';
import { createRequestQuery } from '@/utils/request';

export default {
  async getProjectSource(slug, queryParams = {}) {
    const { project } = Config.state;
    if (!slug) {
      throw new Error('Please provide a valid id to request data of source.');
    }

    const params = createRequestQuery(queryParams);

    const response = await http.get(
      `/projects/${project.uuid}/sources/${slug}/search/`,
      { params },
    );

    const sources = response.results.map((source) => {
      return new Source({
        uuid: source.uuid,
        name: source.name,
      });
    });

    return sources;
  },
};
