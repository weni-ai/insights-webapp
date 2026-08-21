import http from '@/services/api/http';

import { useConfig } from '@/store/modules/config';

interface VerifyCTWAData {
  exists: boolean;
  queued?: boolean;
}

export default {
  async verifyCTWA(): Promise<VerifyCTWAData> {
    const { project } = useConfig();
    const url = `/projects/${project.uuid}/ctwa/verify/`;
    const response = await http.get(url);
    return response.data;
  },
};
