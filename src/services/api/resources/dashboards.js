import { Dashboard, Filter, Widget } from '@/models';
import http from '@/services/api/http';

import { useConfig } from '@/store/modules/config';
import { useDashboards } from '@/store/modules/dashboards';
import { useUser } from '@/store/modules/user';

import { isFilteringDates } from '@/utils/filter';
import { createRequestQuery, parseQueryString } from '@/utils/request';

const mockConversationalDashboard = {
  config: {
    type: 'conversational',
  },
  grid: [2, 3],
  is_default: false,
  is_deletable: false,
  is_editable: false,
  name: 'Conversational',
  uuid: 'f58b3945-a641-4c8e-9e6d-b4644d8172f7',
};

export default {
  async getAll({ nextReq } = {}) {
    const nextParams = parseQueryString(nextReq);

    const queryParams = createRequestQuery({
      ...nextParams,
      project: useConfig().project?.uuid,
    });

    const response = await http.get('/dashboards/', {
      params: queryParams,
    });

    // TODO: Remove this mock after the API is updated
    response.results = [...response.results, mockConversationalDashboard];

    const dashboards = response.results.map(
      (dashboard) =>
        new Dashboard(
          dashboard.uuid,
          dashboard.name,
          { columns: dashboard.grid[0], rows: dashboard.grid[1] },
          dashboard.is_default,
          dashboard.is_editable,
          dashboard.is_deletable,
          dashboard.config,
        ),
    );

    return { dashboards, next: response.next, previous: response.previous };
  },

  async getDashboardFilters(uuid) {
    // TODO: Remove this mock after the API is updated
    if (uuid === mockConversationalDashboard.uuid) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            new Filter({
              name: 0,
              label: null,
              placeholder: null,
              type: 'date_range',
              start_sufix: '_start',
              end_sufix: '_end',
            }),
          ]);
        }, 1000);
      });
    }

    if (!uuid) {
      throw new Error(
        'Please provide a valid UUID to request dashboard filters.',
      );
    }

    const queryParams = createRequestQuery({
      project: useConfig().project?.uuid,
    });

    const response = await http.get(`/dashboards/${uuid}/filters/`, {
      params: queryParams,
    });

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
        key_value_field: filter.field,
      });
    });

    return dashboardFilters;
  },

  async getDashboardWidgets(uuid) {
    // TODO: Remove this mock after the API is updated
    if (uuid === mockConversationalDashboard.uuid)
      return [
        new Widget({
          uuid: 'f58b3945-a641-4c8e-9e6d-b4644d8172f7',
          name: 'Conversational',
          type: 'conversational',
          config: null,
          grid_position: {
            column_start: 1,
            column_end: 2,
            row_start: 1,
            row_end: 3,
          },
        }),
      ];

    if (!uuid) {
      throw new Error(
        'Please provide a valid UUID parameter to request widgets from this dashboard.',
      );
    }

    const queryParams = createRequestQuery({
      project: useConfig().project?.uuid,
    });

    const response = await http.get(`/dashboards/${uuid}/list_widgets/`, {
      params: queryParams,
    });

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
        is_configurable: widget.is_configurable,
      });
    });

    return widgets;
  },

  async getDashboardWidgetData({ dashboardUuid, widgetUuid, params }) {
    const { appliedFilters, currentDashboardFilters } = useDashboards();

    const hasDateFilter = isFilteringDates({
      currentDashboardFilters,
      appliedFilters,
    });

    if (!dashboardUuid || !widgetUuid) {
      throw new Error(
        'Please provide valids UUIDs parameters to request data of widget.',
      );
    }

    const treatedParams = createRequestQuery(appliedFilters, {
      project: useConfig().project?.uuid,
      is_live: !hasDateFilter || undefined,
      ...params,
    });
    const widgetData = await http.get(
      `/dashboards/${dashboardUuid}/widgets/${widgetUuid}/data/`,
      { params: treatedParams },
    );

    return widgetData;
  },

  async getCustomStatusData({ params }) {
    const { email } = useUser();

    const treatedParams = createRequestQuery(params, {
      project: useConfig().project?.uuid,
      user_request: email,
    });
    const widgetData = await http.get(`/dashboards/get_custom_status/`, {
      params: treatedParams,
    });

    return widgetData;
  },

  async getDashboardWidgetReport({ dashboardUuid, widgetUuid }) {
    if (!dashboardUuid || !widgetUuid) {
      throw new Error(
        'Please provide valids UUIDs parameters to request report of widget.',
      );
    }

    const queryParams = createRequestQuery({
      project: useConfig().project?.uuid,
    });

    const widgetData = await http.get(
      `/dashboards/${dashboardUuid}/widgets/${widgetUuid}/report/`,
      { params: queryParams },
    );

    return widgetData;
  },

  async getDashboardWidgetReportData({
    dashboardUuid,
    widgetUuid,
    slug,
    offset,
    limit,
    next,
  }) {
    const { appliedFilters, currentDashboardFilters } = useDashboards();

    const hasDateFilter = isFilteringDates({
      currentDashboardFilters,
      appliedFilters,
    });

    if (!dashboardUuid || !widgetUuid) {
      throw new Error(
        'Please provide valids UUIDs parameters to request report data of widget.',
      );
    }

    const queryParams = createRequestQuery(appliedFilters, {
      slug,
      project: useConfig().project?.uuid,
      offset,
      limit,
      next,
      is_live: !hasDateFilter || undefined,
    });

    const reportData = await http.get(
      `/dashboards/${dashboardUuid}/widgets/${widgetUuid}/report/data/`,
      { params: queryParams },
    );

    return reportData;
  },

  async setDefaultDashboard({ dashboardUuid, isDefault }) {
    const queryParams = createRequestQuery({
      project: useConfig().project?.uuid,
    });
    const response = await http.patch(
      `/dashboards/${dashboardUuid}/is_default/`,
      { is_default: isDefault },
      {
        params: queryParams,
      },
    );

    return response;
  },

  async createFlowsDashboard({ dashboardName, funnelAmount, currencyType }) {
    const reqBody = {
      name: dashboardName,
      funnel_amount: funnelAmount,
      currency_type: currencyType,
    };
    const response = await http.post(
      '/dashboards/create_flows_dashboard/',
      reqBody,
      { params: { project: useConfig().project?.uuid } },
    );

    return response;
  },

  async updateFlowsDashboard({ dashboardUuid, dashboardName, currencyType }) {
    const reqBody = {
      name: dashboardName,
      config: { currency_type: currencyType },
    };
    const response = await http.patch(
      `/dashboards/${dashboardUuid}/`,
      reqBody,
      {
        params: { project: useConfig().project?.uuid },
      },
    );
    return response;
  },

  async deleteDashboard(dashboardUuid) {
    const response = await http.delete(`/dashboards/${dashboardUuid}/`, {
      params: { project: useConfig().project?.uuid },
    });
    return response;
  },
};
