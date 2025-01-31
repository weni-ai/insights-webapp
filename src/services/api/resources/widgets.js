import { WidgetOutgoing } from '@/models';

import Config from '@/store/modules/config';
import Dashboard from '@/store/modules/dashboards';
import User from '@/store/modules/user';

import http from '@/services/api/http';

import { createRequestQuery } from '@/utils/request';

export default {
  async updateWidget({ widget }) {
    if (!widget) {
      throw new Error('Please provide a valid uuid to request update widget.');
    }

    const response = await http.patch(
      `/widgets/${widget.uuid}/`,
      new WidgetOutgoing(widget),
    );

    return response;
  },

  async getFlowContactResults({ flow, result, label, limit, page }) {
    const { project } = Config.state;
    const { appliedFilters } = Dashboard.state;
    const { email } = User.state;

    const params = createRequestQuery(appliedFilters, {
      page_number: page,
      page_size: limit,
      project_uuid: project?.uuid,
      op_field: result,
      label,
      flow_uuid: flow,
      user_email: email,
    });

    const response = await http.get(`/dashboards/get_contacts_results/`, {
      params,
    });

    return response;
  },
};
