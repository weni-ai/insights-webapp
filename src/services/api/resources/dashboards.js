import { Dashboard, Filter, Widget } from '@/models';
import http from '@/services/api/http';
import Config from '@/store/modules/config';
import DashboardState from '@/store/modules/dashboards';

import { createRequestQuery } from '@/utils/request';

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

  async getDashboardFilters(uuid) {
    if (!uuid) {
      throw new Error(
        'Please provide a valid UUID to request dashboard filters.',
      );
    }

    const response = await http.get(`/dashboards/${uuid}/filters`);
    const responseArray = Object.keys(response);

    const dashboardFilters = responseArray.map((key) => {
      const filter = response[key];
      return new Filter({
        name: key,
        label: filter.label,
        placeholder: filter.placeholder,
        type: filter.type,
        source: filter.source,
        depends_on: filter.depends_on,
        start_sufix: filter.start_sufix,
        end_sufix: filter.end_sufix,
      });
    });

    return dashboardFilters;
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
        type: widget.type,
        config: widget.config,
        grid_position: {
          column_start: widget.position.columns[0],
          column_end: widget.position.columns[1],
          row_start: widget.position.rows[0],
          row_end: widget.position.rows[1],
        },
        report: widget.report,
        source: widget.source,
      });
    });

    return widgets;
  },

  async getDashboardWidgetData({ dashboardUuid, widgetUuid }) {
    if (!dashboardUuid || !widgetUuid) {
      throw new Error(
        'Please provide valids UUIDs parameters to request data of widget.',
      );
    }

    const params = createRequestQuery(DashboardState.state.appliedFilters);
    const widgetData = await http.get(
      `/dashboards/${dashboardUuid}/widgets/${widgetUuid}/data`,
      { params },
    );

    return widgetData;
  },

  async getDashboardWidgetReport({ dashboardUuid, widgetUuid }) {
    if (!dashboardUuid || !widgetUuid) {
      throw new Error(
        'Please provide valids UUIDs parameters to request report of widget.',
      );
    }

    const widgetData = await http.get(
      `/dashboards/${dashboardUuid}/widgets/${widgetUuid}/report`,
    );

    return widgetData;
  },

  async getDashboardWidgetReportData({ dashboardUuid, widgetUuid, slug }) {
    if (!dashboardUuid || !widgetUuid) {
      throw new Error(
        'Please provide valids UUIDs parameters to request report data of widget.',
      );
    }

    const queryParams = createRequestQuery(
      DashboardState.state.appliedFilters,
      {
        slug,
      },
    );

    const reportData = await http.get(
      `/dashboards/${dashboardUuid}/widgets/${widgetUuid}/report/data`,
      { params: queryParams },
    );

    return reportData;
  },

  async setDefaultDashboard({ dashboardUuid, isDefault }) {
    const queryParams = {
      project: project.uuid,
    };
    const response = await http.patch(
      `/dashboards/${dashboardUuid}/is_default`,
      { is_default: isDefault },
      {
        params: queryParams,
      },
    );

    return response;
  },
};
