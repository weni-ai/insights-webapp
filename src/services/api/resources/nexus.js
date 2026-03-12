import { useConfig } from '@/store/modules/config';
import nexusHttp from '@/services/api/nexusHttp';

export default {
  async getAgentsTeam() {
    const { project } = useConfig();
    return await nexusHttp.get(`/api/agents/teams/${project.uuid}`);
  },
  async activateAgent(uuid) {
    const { project } = useConfig();
    return await nexusHttp.patch(
      `/api/project/${project.uuid}/assign/${uuid}`,
      {
        assigned: true,
      },
    );
  },
};
