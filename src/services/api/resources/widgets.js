import { WidgetOutgoing } from '@/models';

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
};
