import { Dashboard } from '@/models';
import http from '@/services/api/http';
import Config from '@/store/modules/config';

const { project } = Config.state;

export default {
  async getAll() {
    const response = await http.get('/dashboards', {
      params: { project: project.uuid },
    });

    const dashboards = response.results.map(
      (dashboard) =>
        new Dashboard(dashboard.uuid, dashboard.name, dashboard.is_default),
    );

    return dashboards;
  },
};
