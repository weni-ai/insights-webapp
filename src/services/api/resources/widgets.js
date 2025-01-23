import { WidgetOutgoing } from '@/models';
import Config from '@/store/modules/config';

import http from '@/services/api/http';

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

  async getFlowContactResults({ flow, result, label, limit, offset }) {
     const { project } = Config.state;
    const response = await http.get(`/contact_results/flow/${flow}/`, {
      params: {
        label,
        op_field: result,
        limit,
        offset,
        project: project?.uuid
      },
    });
    return response.data;
  },
};
