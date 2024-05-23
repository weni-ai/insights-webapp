import { Dashboard, Widget } from '@/models';
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
        new Dashboard(
          dashboard.uuid,
          dashboard.name,
          { columns: dashboard.grid[0], rows: dashboard.grid[1] },
          dashboard.is_default,
        ),
    );

    return dashboards;
  },

  async getDashboardWidgets(uuid) {
    if (!uuid) {
      throw new Error(
        'Please provide a valid UUID parameter to request widgets from this dashboard.',
      );
    }

    const response = await http.get(`/dashboards/${uuid}/widgets`);

    const widgets = response.results.map((widget) => {
      return new Widget({
        uuid: widget.uuid,
        name: widget.name,
        type: widget.w_type,
        config: widget.config,
        grid_position: {
          column_start: widget.position.y[0],
          column_end: widget.position.y[1],
          row_start: widget.position.x[0],
          row_end: widget.position.x[1],
        },
        report: widget.report,
        source: widget.source,
      });
    });

    return widgets;
  },
};
