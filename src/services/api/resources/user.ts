import http from '@/services/api/http';
import { useConfig } from '@/store/modules/config';

export default {
  async verifyIsViewerPermission(): Promise<boolean> {
    const { project } = useConfig();

    const response = (await http.get(
      `/projects/${project.uuid}/verify_viewer/`,
    )) as boolean;

    return response;
  },
};
